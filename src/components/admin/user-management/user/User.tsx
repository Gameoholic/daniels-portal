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

import { AdminActions_GetUser_Result } from "@/src/actions/per-page/admin";
import UserInfoTab from "@/src/components/admin/user-management/user/UserInfoTab";
import UserPermissionsTab from "@/src/components/admin/user-management/user/UserPermissionsTab";
import UserTokensTab from "@/src/components/admin/user-management/user/UserTokensTab";
import UserActionsTab from "@/src/components/admin/user-management/user/UserActionsTab";

export default function UserManagementUser({
  user,
  loading,
  errorString,
  canManageUsers,
}: {
  user: AdminActions_GetUser_Result | null;
  loading: boolean;
  errorString: string;
  canManageUsers: boolean;
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
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          {canManageUsers && (
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
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info">User Info</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="tokens">Access Tokens</TabsTrigger>
            <TabsTrigger value="actions">User Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <UserInfoTab user={user} isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="permissions">
            <UserPermissionsTab
              user={user}
              isEditing={isEditing}
              onUnimplemented={triggerUnimplemented}
            />
          </TabsContent>

          <TabsContent value="tokens">
            <UserTokensTab
              user={user}
              canManageUsers={canManageUsers}
              onUnimplemented={triggerUnimplemented}
            />
          </TabsContent>

          <TabsContent value="actions">
            <UserActionsTab
              canManageUsers={canManageUsers}
              onUnimplemented={triggerUnimplemented}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Unimplemented Dialog */}
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
