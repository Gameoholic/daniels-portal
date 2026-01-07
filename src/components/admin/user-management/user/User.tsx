"use client";

import { useState } from "react";
import { Pencil, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AdminActions_GetUser_Result,
  AdminActions_GetUser_Result_Permission,
} from "@/src/actions/per-page/admin";
import UserInfoTab from "@/src/components/admin/user-management/user/UserInfoTab";
import UserPermissionsTab from "@/src/components/admin/user-management/user/UserPermissionsTab";
import UserTokensTab from "@/src/components/admin/user-management/user/UserTokensTab";
import UserActionsTab from "@/src/components/admin/user-management/user/UserActionsTab";

export default function UserManagementUser({
  user,
  loading,
  errorString,
  canManagePermissions,
  availablePermissions,
}: {
  user: AdminActions_GetUser_Result | null;
  loading: boolean;
  errorString: string;
  canManagePermissions: boolean;
  availablePermissions: AdminActions_GetUser_Result_Permission[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showUnimplemented, setShowUnimplemented] = useState(false);
  const [unimplementedReason, setUnimplementedReason] = useState("");

  function triggerUnimplemented(reason: string) {
    setUnimplementedReason(reason);
    setShowUnimplemented(true);
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading user…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <p className="text-destructive">{errorString || "User not found"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.username}
            </h1>
            <p className="text-sm text-muted-foreground">ID: {user.id}</p>
          </div>

          {/* {canManageUsers && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={() => triggerUnimplemented("Save user changes")}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )} */}
        </div>

        <Tabs defaultValue="info">
          <TabsList className="flex gap-6 border-b bg-transparent">
            <TabTrigger value={"info"} title={"User Info"} />
            <TabTrigger value={"permissions"} title={"Permissions"} />
            <TabTrigger value={"access-tokens"} title={"Access Tokens"} />
            <TabTrigger value={"actions"} title={"Actions"} />
          </TabsList>

          <TabsContent value="info" className="pt-3">
            <UserInfoTab user={user} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="permissions" className="pt-3">
            <UserPermissionsTab
              user={user}
              availablePermissions={availablePermissions}
              canManagePermissions={canManagePermissions}
              onUnimplemented={triggerUnimplemented}
            />
          </TabsContent>

          <TabsContent value="access-tokens" className="pt-3">
            <UserTokensTab user={user} onUnimplemented={triggerUnimplemented} />
          </TabsContent>

          <TabsContent value="actions" className="pt-3">
            <UserActionsTab onUnimplemented={triggerUnimplemented} />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showUnimplemented} onOpenChange={setShowUnimplemented}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not implemented</DialogTitle>
            <DialogDescription>
              This action is not implemented yet.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Attempted action: <strong>{unimplementedReason}</strong>
          </p>
          <DialogFooter>
            <Button onClick={() => setShowUnimplemented(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function TabTrigger({ value, title }: { value: string; title: string }) {
  return (
    <TabsTrigger
      value={value}
      className="relative pb-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground 
      data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0
      data-[state=active]:after:h-[2px] data-[state=active]:after:w-full data-[state=active]:after:bg-foreground
border-0
      "
    >
      {title}
    </TabsTrigger>
  );
}
