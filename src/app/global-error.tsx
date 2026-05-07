"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: "#F8FAFB",
          color: "#1A202C",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "16px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Something went wrong
        </h1>
        <p style={{ color: "#4A5568", marginBottom: "24px", fontSize: "14px" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "12px 24px",
            borderRadius: "9999px",
            background: "#0B6E6E",
            color: "white",
            border: "none",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            minHeight: "44px",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
