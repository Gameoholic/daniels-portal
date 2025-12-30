import { CircleQuestionMark, ShieldAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export default function UserPermissionsTab({
  user,
  isEditing,
  onUnimplemented,
}: {
  user: AdminActions_GetUser_Result;
  isEditing: boolean;
  onUnimplemented: (reason: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {user.permissions.map((perm) => (
          <div key={perm} className="flex items-center gap-1">
            {perm.includes("admin") && (
              <ShieldAlert className="h-5 w-5 text-error-foreground" />
            )}
            <span className="mr-1 text-sm">{perm}</span>
            <PermissionExplanationTooltip permission={perm} />
            {/* {isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUnimplemented(`Toggle permission: ${perm}`)}
              >
                Toggle
              </Button>
            )} */}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// todo: move permission explanation to database entry in the permissions table. also add "is dangerous" or "is account creation code" as database fields. or something
function PermissionExplanationTooltip({ permission }: { permission: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">{permission}</p>
          <p className="text-wrap">
            Recommended to choose the shortest duration for security reasons,
            while also considering convenience, so that you won't need to log in
            with your password too frequently.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
