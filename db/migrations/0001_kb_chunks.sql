-- Knowledge base chunks for RAG retrieval.
create extension if not exists vector;

create table if not exists kb_chunks (
  id text primary key,
  article_id text not null,
  article_slug text not null,
  article_title text not null,
  category_slug text,
  chunk_idx int not null,
  content text not null,
  token_count int not null,
  embedding vector(1536) not null,
  clinically_reviewed boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists kb_chunks_embedding_idx
  on kb_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists kb_chunks_article_id_idx on kb_chunks (article_id);

-- Cosine-similarity retrieval RPC. Uses 1 - distance so callers get a [0,1]
-- similarity score with higher = better, and the threshold is intuitive.
create or replace function match_kb_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold float default 0.2
)
returns table (
  id text,
  article_id text,
  article_slug text,
  article_title text,
  category_slug text,
  chunk_idx int,
  content text,
  similarity float,
  clinically_reviewed boolean,
  updated_at timestamptz
)
language sql
stable
as $$
  select
    id,
    article_id,
    article_slug,
    article_title,
    category_slug,
    chunk_idx,
    content,
    1 - (embedding <=> query_embedding) as similarity,
    clinically_reviewed,
    updated_at
  from kb_chunks
  where 1 - (embedding <=> query_embedding) > similarity_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Per-session usage counters for chat rate limiting.
create table if not exists chat_session_usage (
  session_id text primary key,
  count_1h int not null default 0,
  window_1h_started_at timestamptz not null default now(),
  count_24h int not null default 0,
  window_24h_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Bumps the per-session counters atomically and returns the new state plus a
-- flag indicating whether the caller is over either limit. Windows reset
-- whenever the previous window has fully elapsed.
create or replace function bump_chat_session_usage(
  p_session_id text,
  p_limit_1h int default 20,
  p_limit_24h int default 200
)
returns table (
  count_1h int,
  count_24h int,
  over_limit boolean,
  retry_after_seconds int
)
language plpgsql
as $$
declare
  now_ts timestamptz := now();
  rec chat_session_usage%rowtype;
  reset_1h boolean;
  reset_24h boolean;
  next_count_1h int;
  next_count_24h int;
  retry_seconds int := 0;
  is_over boolean := false;
begin
  insert into chat_session_usage (session_id)
    values (p_session_id)
    on conflict (session_id) do nothing;

  select * into rec from chat_session_usage where session_id = p_session_id for update;

  reset_1h := now_ts - rec.window_1h_started_at >= interval '1 hour';
  reset_24h := now_ts - rec.window_24h_started_at >= interval '24 hours';

  next_count_1h := case when reset_1h then 1 else rec.count_1h + 1 end;
  next_count_24h := case when reset_24h then 1 else rec.count_24h + 1 end;

  if next_count_1h > p_limit_1h then
    is_over := true;
    retry_seconds := greatest(
      1,
      ceil(extract(epoch from (rec.window_1h_started_at + interval '1 hour' - now_ts)))::int
    );
  elsif next_count_24h > p_limit_24h then
    is_over := true;
    retry_seconds := greatest(
      1,
      ceil(extract(epoch from (rec.window_24h_started_at + interval '24 hours' - now_ts)))::int
    );
  end if;

  if is_over then
    -- Don't bump counters past the limit; just return the state.
    return query select rec.count_1h, rec.count_24h, true, retry_seconds;
    return;
  end if;

  update chat_session_usage
    set count_1h = next_count_1h,
        count_24h = next_count_24h,
        window_1h_started_at = case when reset_1h then now_ts else rec.window_1h_started_at end,
        window_24h_started_at = case when reset_24h then now_ts else rec.window_24h_started_at end,
        updated_at = now_ts
    where session_id = p_session_id;

  return query select next_count_1h, next_count_24h, false, 0;
end;
$$;
