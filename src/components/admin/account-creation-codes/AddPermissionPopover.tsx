"use client";

import { useState } from "react";
import {
  Check,
  ShieldAlert,
  Plus,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
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

import { addPermissionToAccountCreationCodeAction } from "@/src/actions/per-page/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PermissionData } from "@/src/db/_internal/per-table/permissions";

export function AddPermissionPopver({
  accountCreationCodeId,
  userCurrentPermissions,
  availablePermissions,
  router,
}: {
  accountCreationCodeId: string;
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

  // Group permissions by category. Categories are sorted reverse alphabetically, permissions per category are sorted alphabetically.
  const permissionsSortedAndByCategory = Object.entries(
    availablePermissionNamesNotOnUser.reduce<Record<string, string[]>>(
      (acc, permissionName) => {
        const category = availablePermissions[permissionName].category;
        (acc[category] ??= []).push(permissionName);
        return acc;
      },
      {}
    )
  )
    .map(
      ([category, permissions]) =>
        [category, permissions.sort((a, b) => a.localeCompare(b))] as const
    )
    .sort(([a], [b]) => b.localeCompare(a));

  async function addPermission(permissionToAdd: string) {
    if (loading) return;

    setLoading(true);
    const addPermissionToAccountCreationCodeActionResult =
      await addPermissionToAccountCreationCodeAction(
        accountCreationCodeId,
        permissionToAdd
      );
    if (!addPermissionToAccountCreationCodeActionResult.success) {
      setError("Couldn't add permission to code.");
      toast("Couldn't add permission.", {
        description: addPermissionToAccountCreationCodeActionResult.errorString,
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
      {/* Add permission button (opens the popover) */}
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={availablePermissionNamesNotOnUser.length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
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
            {/* Permissions */}
            {permissionsSortedAndByCategory.map(
              ([category, permissionNames]) => (
                <PermissionsCategory
                  category={category}
                  permissionNames={permissionNames}
                />
              )
            )}
          </CommandList>
        </Command>

        {/* Cancel & Add buttons */}
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

  function PermissionsCategory({
    category,
    permissionNames,
  }: {
    category: string;
    permissionNames: string[];
  }) {
    return (
      <CommandGroup key={category} heading={category} className="pr-2">
        {permissionNames.map((permissionName) => {
          return (
            <PermissionItem
              permissionName={permissionName}
              permissionData={availablePermissions[permissionName]}
            />
          );
        })}
      </CommandGroup>
    );
  }

  function PermissionItem({
    permissionName,
    permissionData,
  }: {
    permissionName: string;
    permissionData: PermissionData;
  }) {
    return (
      <CommandItem
        key={permissionName}
        value={permissionData.description}
        onSelect={() => setSelectedPermission(permissionName)}
        className="items-start gap-2"
      >
        <Check
          className={`mt-1 h-4 w-4 shrink-0 ${
            selectedPermission === permissionName ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="flex flex-col">
          <div className="flex items-center">
            {permissionData.isPrivileged && (
              <ShieldAlert className="h-5 w-5 text-error-foreground mr-1" />
            )}
            <span className="text-sm font-medium break-all">
              {permissionName}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {permissionData.description}
          </span>
        </div>
      </CommandItem>
    );
  }
}
