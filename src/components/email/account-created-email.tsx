export function AccountCreatedSuccessfullyEmail({
  username,
  userId,
}: {
  username: string;
  userId: string;
}) {
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
            Your account has been created 🎉
          </h1>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "#334155",
              marginBottom: "16px",
            }}
          >
            Hi <strong>{username}</strong>,
            <br />
            <br />
            Your account on <strong>{process.env.SITE_NAME}</strong> was
            successfully created. You can now log in and start using the
            platform.
          </p>

          {/* Account info */}
          <div
            style={{
              margin: "24px 0",
              padding: "16px",
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                marginBottom: "6px",
              }}
            >
              Account details
            </div>

            <div
              style={{
                fontSize: "14px",
                lineHeight: "22px",
                color: "#020617",
              }}
            >
              <div>
                <strong>Username:</strong> {username}
              </div>
              <div>
                <strong>User ID:</strong> {userId}
              </div>
            </div>
          </div>

          {/* CTA */}
          <p
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "#334155",
              marginBottom: "16px",
            }}
          >
            You can log in anytime by visiting{" "}
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
            .
          </p>

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
            If you did not create this account, please contact support
            immediately and do not attempt to log in.
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
        This message was sent automatically. Please do not reply to this email.
      </p>
    </div>
  );
}
