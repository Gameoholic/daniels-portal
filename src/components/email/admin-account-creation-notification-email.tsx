export function AdminAccountCreationNotificationEmail({
  codeId,
  codeTitle,
  username,
  userId,
  permissions,
  email,
}: {
  codeId: string;
  codeTitle: string;
  username: string;
  userId: string;
  permissions: string[];
  email: string;
}) {
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
          {process.env.SITE_NAME} – Account Created
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
            Account creation code used
          </h1>

          <p
            style={{
              fontSize: "14px",
              lineHeight: "22px",
              color: "#334155",
              marginBottom: "16px",
            }}
          >
            The account creation code{" "}
            <strong>{codeTitle === "" ? codeId : codeTitle}</strong> has been
            used to create a new account. Details of the newly created account
            are as follows:
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
              <div>
                <strong>Email:</strong> {email}
              </div>
              <div>
                <strong>Permissions:</strong>{" "}
                {permissions.length > 0 ? permissions.join(", ") : "None"}
              </div>
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
            This is an automated notification to let you know that the account
            creation code you issued has been used.
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
