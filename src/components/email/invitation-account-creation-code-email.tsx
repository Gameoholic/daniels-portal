export function InvitationToJoinSiteEmail({
  code,
  codeExpirationTimestamp,
}: {
  code: string;
  codeExpirationTimestamp: Date;
}) {
  const now = Date.now();
  const expiresAt = new Date(codeExpirationTimestamp).getTime();
  const diffMs = Math.max(expiresAt - now, 0);

  const minutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let expiresInText = "expires soon";
  if (days > 0) {
    expiresInText = `expires in ${days} day${days === 1 ? "" : "s"}`;
  } else if (hours > 0) {
    expiresInText = `expires in ${hours} hour${hours === 1 ? "" : "s"}`;
  } else if (minutes > 0) {
    expiresInText = `expires in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const siteUrl = `https://www.${process.env.DOMAIN}`;

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        padding: "24px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen',
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 600,
            fontSize: "16px",
            backgroundColor: "#ffffff",
          }}
        >
          Welcome to {process.env.SITE_NAME}
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Create your account
          </h1>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "#334155",
              marginBottom: "16px",
            }}
          >
            You&apos;ve been invited to create an account on{" "}
            <strong>{process.env.SITE_NAME}</strong>. To continue, visit{" "}
            <a
              href={siteUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "#2563eb",
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              {siteUrl}
            </a>
            , click <strong>Create account</strong>, and enter the code below
            when prompted.
          </p>

          {/* Code box */}
          <div
            style={{
              margin: "24px 0",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "8px",
              }}
            >
              Account creation code
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                letterSpacing: "6px",
                color: "#020617",
                marginBottom: "6px",
              }}
            >
              {code}
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              {expiresInText}
            </div>
          </div>

          {/* Warning */}
          <div
            style={{
              fontSize: "13px",
              lineHeight: "20px",
              color: "#64748b",
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            Please mark us as <strong>not spam</strong> in your mail service.
            Otherwise, future important email communications from us might be
            sent to your spam folder, or not delivered at all.
          </div>
        </div>
      </div>

      <p
        style={{
          maxWidth: "560px",
          margin: "16px auto 0",
          fontSize: "12px",
          lineHeight: "18px",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        This message was sent automatically. If you did not expect this
        invitation, you can safely ignore this email.
      </p>
    </div>
  );
}
