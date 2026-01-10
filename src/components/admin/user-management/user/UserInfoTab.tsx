import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleQuestionMark } from "lucide-react";
import SensitiveComponent from "@/src/components/global/SensitiveComponent";

function formatDateTime(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IL");
}

export default function UserInfoTab({
  user,
  isEditing,
}: {
  user: AdminActions_GetUser_Result;
  isEditing: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-medium mb-1">Email</p>
        <SensitiveComponent secureLength={user?.email.length}>
          <span className="font-medium text-1xl text-muted-foreground">
            {user?.email}
          </span>
        </SensitiveComponent>
      </div>

      <div>
        <p className="font-medium">Created</p>
        <p className="text-muted-foreground">
          {formatDateTime(user.creationTimestamp)}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Last login</span>
          <LastLoginTooltip />
        </div>
        <p className="text-muted-foreground">
          {formatDateTime(user.lastLoginTimestamp)}
        </p>
      </div>

      <div>
        <div className="flex items-center gap-1">
          <span className="font-medium">Last account usage</span>
          <LastAccountUsageTooltip />
        </div>
        <p className="text-muted-foreground">
          {formatDateTime(
            user.accessTokens
              .filter((x) => x.lastUseTimestamp != null)
              .sort(
                (a, b) =>
                  b.lastUseTimestamp!.getTime() - a.lastUseTimestamp!.getTime()
              )
              .at(0)?.lastUseTimestamp ?? null
          )}
        </p>
      </div>
    </div>
  );
}

function LastLoginTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            The last successful log in made on this account using a password.
            This does not include devices accessing the account via pre-existing
            access tokens.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function LastAccountUsageTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            The last time any access token was used to access the website (can
            be opening a page, changing/accessing data, etc.)
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
