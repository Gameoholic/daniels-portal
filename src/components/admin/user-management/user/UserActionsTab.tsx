import { Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function UserActionsTab({
  canManageUsers,
  onUnimplemented,
}: {
  canManageUsers: boolean;
  onUnimplemented: (reason: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">Dangerous Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <Button
          variant="destructive"
          disabled={!canManageUsers}
          onClick={() => onUnimplemented("Delete user permanently")}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </CardContent>
    </Card>
  );
}
