"use client";

import {
  CircleQuestionMark,
  ShieldAlert,
  Trash,
  Plus,
  Check,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

import {
  AdminActions_GetUser_Result,
  AdminActions_GetUser_Result_Permission,
  deleteUserPermissionAction,
} from "@/src/actions/per-page/admin";
import { toast } from "sonner";

export default function UserPermissionsTab({
  user,
  availablePermissions,
  canManagePermissions,
  onUnimplemented,
}: {
  user: AdminActions_GetUser_Result;
  availablePermissions: AdminActions_GetUser_Result_Permission[];
  canManagePermissions: boolean;
  onUnimplemented: (reason: string) => void;
}) {
  const [removingPermission, setRemovingPermission] = useState("");
  const [error, setError] = useState<string>("");

  async function removePermission(permissionToRemove: string) {
    if (removingPermission) {
      return;
    }
    setRemovingPermission(permissionToRemove);

    const deleteUserPermissionActionResult = await deleteUserPermissionAction(
      user.id,
      permissionToRemove
    );
    if (!deleteUserPermissionActionResult.success) {
      setError("Couldn't update max tokens.");
      // for ALL action forms in the website we need to handle errors, so far we don't.
      toast("Couldn't remove permission.", {
        description: deleteUserPermissionActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Successfully removed permission.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
    setRemovingPermission("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">Permissions</p>

        {canManagePermissions ? (
          <AddPermissionPopver
            userCurrentPermissions={Object.keys(user.permissions)}
            availablePermissions={availablePermissions}
          />
        ) : null}
      </div>

      {user.permissions.map((x) => {
        return (
          <div key={x.permission} className="flex items-center gap-1">
            {canManagePermissions ? (
              <button
                onClick={() => {
                  removePermission(x.permission);
                }}
                className={`p-1 rounded ${
                  removingPermission == "" ? "hover:bg-accent" : ""
                }`}
                disabled={removingPermission != ""}
              >
                <Trash
                  className={`h-5 w-5 ${
                    removingPermission == ""
                      ? "text-muted-foreground"
                      : "text-muted"
                  }`}
                />
              </button>
            ) : null}

            {x.permission.includes("admin") && (
              <ShieldAlert className="h-5 w-5 text-error-foreground" />
            )}

            <span className="text-sm mr-1">{x.permission}</span>

            <PermissionExplanationTooltip description={x.description} />
          </div>
        );
      })}
    </div>
  );
}

function PermissionExplanationTooltip({
  description,
}: {
  description: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-96">
          <p className="text-sm">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function AddPermissionPopver({
  userCurrentPermissions,
  availablePermissions,
}: {
  userCurrentPermissions: string[];
  availablePermissions: AdminActions_GetUser_Result_Permission[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(
    null
  );
  // Only show permissions that are not already on the user
  availablePermissions = availablePermissions.filter(
    (x) => !userCurrentPermissions.includes(x.permission)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={availablePermissions.length == 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add permission
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-96" align="end">
        <div className="p-2 border-b">
          <p className="text-sm font-medium">Add permission</p>
        </div>

        <Command>
          <CommandInput placeholder="Type permission name..." />
          <CommandList>
            <CommandEmpty>No permissions found.</CommandEmpty>

            <CommandGroup heading="Available permissions" className="pr-2">
              {availablePermissions.map((permission) => {
                const description = availablePermissions.find(
                  (x) => x.permission == permission.permission
                )?.description;

                return (
                  <CommandItem
                    key={permission.permission}
                    value={permission.description}
                    onSelect={() =>
                      setSelectedPermission(permission.permission)
                    }
                    className="items-start gap-2"
                  >
                    <Check
                      className={`mt-1 h-4 w-4 shrink-0 ${
                        selectedPermission === permission.permission
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />

                    <div className="flex flex-col">
                      <div className="flex items-center">
                        {permission.permission.includes("admin") && (
                          <ShieldAlert className="h-5 w-5 text-error-foreground mr-1" />
                        )}
                        <span className="text-sm font-medium break-all">
                          {permission.permission}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {description}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        <div className="p-2 border-t flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" disabled={!selectedPermission}>
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
