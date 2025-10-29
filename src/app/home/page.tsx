"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { CircleQuestionMark } from "lucide-react"; // https://lucide.dev/icons/

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
      <p className="font-semibold text-2xl mb-2">Welcome, $USERNAME</p>
      <p className="font-medium text-1xl text-muted-foreground">
        User ID: $USER_ID
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        Email: $EMAIL
      </p>
      <p className="font-medium text-1xl text-muted-foreground">
        Last log-in: $LAST_LOGIN
      </p>
      <div className="flex gap-1 items-center">
        <p className="font-medium text-1xl text-muted-foreground">
          Access tokens: $NUMBER
        </p>
        <AccessTokensTooltip />
      </div>
    </div>
  );
}

export function AccessTokensTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            Access tokens are data stored on your device via cookies that allow
            connection to your account without the need to enter a password each
            time.
          </p>
          <p className="text-wrap">
            If there is currently more than one access token, you may have
            previously logged in through other devices.
          </p>
          <p className="text-wrap">
            You can view and revoke access tokens in the account settings, or
            revoke the access token you're currently connected with immediately
            by logging out.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
