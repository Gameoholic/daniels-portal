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
import { useRouter } from "next/navigation";
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
  addUserPermissionAction,
  AdminActions_GetUser_Result,
  AdminActions_GetUser_Result_Permission,
  deleteUserPermissionAction,
} from "@/src/actions/per-page/admin";
import { toast } from "sonner";
import { PermissionData } from "@/src/app/admin/user-management/[userId]/page";
import { DatabaseQueryResult } from "@/src/db/dal";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Separator } from "@/components/ui/separator";

/**
 *
 * @param availablePermissions The permissions that we can *add* or *remove* to the user.
 * @param userPermissions The user's permissions.
 * @returns
 */
export default function UserPermissionsTab({
  userId,
  userPermissions,
  availablePermissions,
  canManagePermissions,
  onUnimplemented,
}: {
  userId: string;
  userPermissions: Record<string, PermissionData>;
  availablePermissions: Record<string, PermissionData>;
  canManagePermissions: boolean;
  onUnimplemented: (reason: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function removePermission(permissionToRemove: string) {
    if (loading) {
      return;
    }
    setLoading(true);

    const deleteUserPermissionActionResult = await deleteUserPermissionAction(
      userId,
      permissionToRemove
    );
    if (!deleteUserPermissionActionResult.success) {
      setError("Couldn't remove permission from user.");
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
      router.refresh();
    }
    setLoading(false);
  }

  // Group permissions by category
  const groupedPermissions: Record<string, [string, PermissionData][]> =
    Object.entries(userPermissions).reduce((acc, [name, data]) => {
      if (!acc[data.category]) acc[data.category] = [];
      acc[data.category].push([name, data]);
      return acc;
    }, {} as Record<string, [string, PermissionData][]>);

  return (
    <div className="flex flex-col">
      <div className="flex justify-end">
        {canManagePermissions ? (
          <AddPermissionPopver
            userId={userId}
            userCurrentPermissions={Object.keys(userPermissions)}
            availablePermissions={availablePermissions}
            router={router}
          />
        ) : null}
      </div>

      {Object.keys(groupedPermissions).length == 0 ? (
        <p className="text-muted-foreground">No permissions.</p>
      ) : null}
      {/* Category */}
      {Object.entries(groupedPermissions)
        .sort(([aCategory], [bCategory]) => bCategory.localeCompare(aCategory)) // Reverse alphabetical order for categories
        .map(([categoryName, permissions]) => (
          <div key={categoryName} className="flex flex-col gap-1.5">
            {/* Category header & separator */}
            <div className="mb-1 border-b border-muted-foreground/40">
              <span className="text-xs font-semibold text-muted-foreground">
                {categoryName}
              </span>
            </div>

            {/* Permissions in this category (sorted alphabetically) */}
            {permissions
              .sort(([aName], [bName]) => aName.localeCompare(bName))
              .map(([permissionName, permissionData]) => (
                <div key={permissionName} className="flex items-center gap-1">
                  {canManagePermissions ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePermission(permissionName)}
                      className={`p-1 rounded mr-2 ${
                        loading ? "" : "hover:bg-accent"
                      }`}
                      disabled={loading}
                    >
                      <Trash
                        className={`h-5 w-5 ${
                          loading ? "text-muted" : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-xs">Remove</span>
                    </Button>
                  ) : null}

                  {permissionData.isPrivileged && (
                    <ShieldAlert className="h-5 w-5 text-error-foreground" />
                  )}

                  <span className="text-sm mr-1">{permissionName}</span>

                  <PermissionExplanationTooltip
                    description={permissionData.description}
                  />
                </div>
              ))}
            <div className="mb-2"></div>
          </div>
        ))}
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
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
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
  userId,
  userCurrentPermissions,
  availablePermissions,
  router,
}: {
  userId: string;
  userCurrentPermissions: string[];
  availablePermissions: Record<string, PermissionData>;
  router: AppRouterInstance;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Filter out permissions the user already has
  const availablePermissionNamesNotOnUser = Object.keys(
    availablePermissions
  ).filter((x) => !userCurrentPermissions.includes(x));

  // Group permissions by category
  const permissionsByCategory: Record<string, string[]> = {};
  availablePermissionNamesNotOnUser.forEach((permissionName) => {
    const category = availablePermissions[permissionName].category;
    if (!permissionsByCategory[category]) permissionsByCategory[category] = [];
    permissionsByCategory[category].push(permissionName);
  });

  async function addPermission(permissionToAdd: string) {
    if (loading) return;

    setLoading(true);
    const addUserPermissionActionResult = await addUserPermissionAction(
      userId,
      permissionToAdd
    );
    if (!addUserPermissionActionResult.success) {
      setError("Couldn't add permission to user.");
      toast("Couldn't add permission.", {
        description: addUserPermissionActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Successfully added permission.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
      setSelectedPermission("");
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={availablePermissionNamesNotOnUser.length === 0}
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

            {/* Loop through each category in reverse alphabetical order */}
            {Object.entries(permissionsByCategory)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([category, permissionNames]) => (
                <CommandGroup
                  key={category}
                  heading={category}
                  className="pr-2"
                >
                  {/* Sort permissions alphabetically */}
                  {permissionNames
                    .sort((a, b) => a.localeCompare(b))
                    .map((permissionName) => {
                      const { description, isPrivileged } =
                        availablePermissions[permissionName];

                      return (
                        <CommandItem
                          key={permissionName}
                          value={description}
                          onSelect={() => setSelectedPermission(permissionName)}
                          className="items-start gap-2"
                        >
                          <Check
                            className={`mt-1 h-4 w-4 shrink-0 ${
                              selectedPermission === permissionName
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />

                          <div className="flex flex-col">
                            <div className="flex items-center">
                              {isPrivileged && (
                                <ShieldAlert className="h-5 w-5 text-error-foreground mr-1" />
                              )}
                              <span className="text-sm font-medium break-all">
                                {permissionName}
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
              ))}
          </CommandList>
        </Command>

        <div className="p-2 border-t flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!selectedPermission || loading}
            onClick={() => {
              if (selectedPermission != null) {
                addPermission(selectedPermission);
              }
            }}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
