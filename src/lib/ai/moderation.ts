// Lightweight content moderation for the chat endpoint.
//
// This is the v1 deterministic layer — fast, cheap, no model calls. A future
// iteration can layer a model-based classifier behind a feature flag if these
// rules prove insufficient.

export type ModerationVerdict =
  | { kind: "ok" }
  | { kind: "emergency"; matchedPattern: string }
  | { kind: "blocked"; reason: string };

const EMERGENCY_PATTERNS: { name: string; re: RegExp }[] = [
  {
    name: "self_harm",
    re: /\b(kill myself|suicide|suicidal|end my life|want to die|hurt myself|self.?harm)\b/i,
  },
  {
    name: "cardiac",
    re: /\b(chest pain|crushing chest|heart attack|can'?t breathe|trouble breathing|shortness of breath)\b/i,
  },
  {
    name: "stroke",
    re: /\b(stroke|face drooping|slurred speech|sudden numbness|can'?t move (my )?arm)\b/i,
  },
  {
    name: "anaphylaxis",
    re: /\b(anaphylaxis|throat closing|can'?t swallow|severe allergic reaction)\b/i,
  },
  {
    name: "severe_bleed",
    re: /\b(uncontrolled bleeding|severe bleeding|bleeding heavily|won'?t stop bleeding)\b/i,
  },
];

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore (all|previous|the above) (instructions|prompts|rules)/i,
  /disregard (your|the) (instructions|system prompt|rules)/i,
  /you are now [^.]*?(no longer|not) bound/i,
  /reveal (your|the) (system prompt|instructions)/i,
];

const TOXIC_PATTERNS: RegExp[] = [
  /\b(fuck you|kill yourself|kys)\b/i,
];

const MAX_INPUT_CHARS = 4000;

export function moderateUserInput(text: string): ModerationVerdict {
  if (!text || !text.trim()) {
    return { kind: "blocked", reason: "Empty message." };
  }
  if (text.length > MAX_INPUT_CHARS) {
    return {
      kind: "blocked",
      reason: `Message too long (${text.length} chars; max ${MAX_INPUT_CHARS}).`,
    };
  }

  for (const { name, re } of EMERGENCY_PATTERNS) {
    if (re.test(text)) return { kind: "emergency", matchedPattern: name };
  }

  for (const re of PROMPT_INJECTION_PATTERNS) {
    if (re.test(text)) {
      return {
        kind: "blocked",
        reason:
          "Sorry, I can't process that request. Please ask your health question directly and I'll do my best to help.",
      };
    }
  }

  for (const re of TOXIC_PATTERNS) {
    if (re.test(text)) {
      return {
        kind: "blocked",
        reason:
          "I'm here to help with health questions. Let's keep the conversation respectful — what can I help you find?",
      };
    }
  }

  return { kind: "ok" };
}
