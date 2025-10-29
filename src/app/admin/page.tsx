"use client";

// Can issue account creation codes by email. User will be able to delete these codes.
// Can manage and delete all account creation codes, even those issued by other users.
// Can delete and see info (last login date, etc.) of other user accounts as well as manage and revoke their access tokens, although they will be obfuscated.
// Can temporarily block users from logging in. This will hard-block them regardless of validy of access tokens.

// Dashboard
// Account creation codes (create + manage/delete)
// Users

export default function AdminPanel() {
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Admin Panel</p>

      <div className="grid grid-cols-4 gap-4">
        <p>test</p>
      </div>
    </div>
  );
}
