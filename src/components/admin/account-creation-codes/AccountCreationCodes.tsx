"use client";

import { useState } from "react";
import {
  Check,
  Shield,
  Mail,
  User,
  Clock,
  Trash2,
  ShieldAlert,
  Terminal,
  UserStar,
  Trash,
  Plus,
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleQuestionMark,
} from "lucide-react";
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
  addPermissionToAccountCreationCodeAction,
  addUserPermissionAction,
  AdminActions_GetAccountCreationCodes_Result,
  removePermissionFromAccountCreationCodeAction,
  revokeAccountCreationCodeAction,
} from "@/src/actions/per-page/admin";
import SensitiveComponent from "@/src/components/custom/sensitive-component";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PermissionData } from "@/src/db/_internal/per-table/permissions";
import { addPermissionToAccountCreationCode } from "@/src/db/_internal/per-table/account-creation-codes";

/* ------------------------- */
/* Date helpers              */
/* ------------------------- */
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IL", { dateStyle: "long" }).format(date);
}

function CheckToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm rounded-md px-2 py-1 transition-colors"
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center ${
          checked
            ? "bg-green-600 border-green-600 text-white"
            : "border-border text-transparent"
        }`}
      >
        <Check className="w-4 h-4" />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function AccountCreationCodes({
  accountCreationCodes,
  availablePermissions,
  propLoading,
  errorString,
}: {
  accountCreationCodes: AdminActions_GetAccountCreationCodes_Result[] | null;
  availablePermissions: Record<string, PermissionData>;
  propLoading: boolean;
  errorString: string;
}) {
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function removePermissionFromCode(
    code: string,
    permissionToRemove: string
  ) {
    if (loading) {
      return;
    }
    setLoading(true);
    const removePermissionFromAccountCreationCodeActionResult =
      await removePermissionFromAccountCreationCodeAction(
        code,
        permissionToRemove
      );
    if (!removePermissionFromAccountCreationCodeActionResult.success) {
      setError("Coukldn't.");
      // for ALL action forms in the website we need to handle errors, so far we don't.
      toast("Couldn't remove the permission.", {
        description:
          removePermissionFromAccountCreationCodeActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Successfully removed the permission.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
      router.refresh();
    }
    setLoading(false);
  }

  async function revokeCode(code: string) {
    if (loading) {
      return;
    }
    setLoading(true);
    const revokeAccountCreationCodeActionResult =
      await revokeAccountCreationCodeAction(code);
    if (!revokeAccountCreationCodeActionResult.success) {
      setError("Coukldn't.");
      // for ALL action forms in the website we need to handle errors, so far we don't.
      toast("Couldn't revoke the code.", {
        description: revokeAccountCreationCodeActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Successfully revoked the code.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
      router.refresh();
    }
    setLoading(false);
  }

  const [emailSettings, setEmailSettings] = useState(() => {
    if (!accountCreationCodes) return {};
    return Object.fromEntries(
      accountCreationCodes.map((c) => [
        c.code,
        {
          onCreatedEmailUser: c.onCreatedEmailUser,
          onCreatedEmailCreator: c.onCreatedEmailCreator,
          onUsedEmailUser: c.onUsedEmailUser,
          onUsedEmailCreator: c.onUsedEmailCreator,
        },
      ])
    );
  });

  if (propLoading || accountCreationCodes == null) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading account creation codes…
      </div>
    );
  }

  const filteredCodes = accountCreationCodes.filter((code) => {
    const q = search.toLowerCase();
    return (
      code.email.toLowerCase().includes(q) ||
      code.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 flex flex-col gap-6">
      <p className="font-semibold text-2xl">Account Creation Codes</p>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by code or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 p-3 rounded-lg border border-border
                   focus:outline-none focus:ring-2 focus:ring-accent
                   focus:border-accent transition-colors"
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCodes.map((code) => {
          const settings = emailSettings[code.code];

          return (
            <div
              key={code.code}
              className="relative rounded-xl border border-border
                         bg-card p-5 shadow-sm flex flex-col gap-4"
            >
              {/* Code & revoke button */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-center text-muted-foreground">
                    <Terminal className="h-5 w-5" />
                    <p className="text-sm">Code</p>
                  </div>
                  <p className="font-mono font-semibold break-all text-xl">
                    {code.code}
                  </p>
                </div>
                <button
                  className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => {
                    revokeCode(code.code);
                  }}
                >
                  <div className="flex items-center gap-1 text-sm">
                    <Trash2 className="w-4 h-4" />
                    <span>Revoke</span>
                  </div>
                </button>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 items-center text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm flex items-center">Email</span>
                </div>
                <SensitiveComponent
                  secureLength={code.email.length}
                  iconSize={4}
                  blurredTextSize="text-sm"
                >
                  <p className="text-sm">{code.email}</p>
                </SensitiveComponent>
              </div>

              {/* Issued by */}
              <div className="flex flex-col gap-1">
                <div className="flex gap-1 items-center text-muted-foreground">
                  <UserStar className="w-4 h-4" />
                  <span className="text-sm flex items-center">Issued by</span>
                </div>
                <Link
                  href={`/admin/user-management/${code.creatorUserId}`}
                  className="inline-flex items-center px-1 py-1 rounded-md hover:bg-accent transition-colors"
                >
                  <span className="text-sm">{code.creatorUsername}</span>
                </Link>
              </div>

              {/* Email notifications section */}
              <div className="flex flex-col gap-2">
                <div className="mb-1 border-b border-muted-foreground/40">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Email notifications
                  </span>
                </div>
                <div className="flex flex-col">
                  <CheckToggle
                    label="On issued – email user"
                    checked={settings.onCreatedEmailUser}
                    disabled={true}
                    onChange={(v) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        [code.code]: {
                          ...prev[code.code],
                          onCreatedEmailUser: v,
                        },
                      }))
                    }
                  />
                  <CheckToggle
                    label="On issued – email creator"
                    checked={settings.onCreatedEmailCreator}
                    disabled={true}
                    onChange={(v) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        [code.code]: {
                          ...prev[code.code],
                          onCreatedEmailCreator: v,
                        },
                      }))
                    }
                  />
                  <CheckToggle
                    label="On used – email user"
                    checked={settings.onUsedEmailUser}
                    disabled={false}
                    onChange={(v) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        [code.code]: { ...prev[code.code], onUsedEmailUser: v },
                      }))
                    }
                  />
                  <CheckToggle
                    label="On used – email creator"
                    checked={settings.onUsedEmailCreator}
                    disabled={false}
                    onChange={(v) =>
                      setEmailSettings((prev) => ({
                        ...prev,
                        [code.code]: {
                          ...prev[code.code],
                          onUsedEmailCreator: v,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              {/* User settings section */}
              <div className="flex flex-col gap-2">
                <div className="mb-1 border-b border-muted-foreground/40">
                  <span className="text-xs font-semibold text-muted-foreground">
                    User settings
                  </span>
                </div>
                {/* Permissions */}

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" /> Permissions
                    </div>
                    <AddPermissionPopver
                      availablePermissions={availablePermissions}
                      router={router}
                      userCurrentPermissions={code.permissions.map(
                        (x) => x.name
                      )}
                      accountCreationCode={code.code}
                    />
                  </span>

                  <div className="flex flex-col gap-1">
                    {(() => {
                      if (code.permissions.length === 0)
                        return (
                          <p className="text-sm text-muted-foreground">
                            No permissions
                          </p>
                        );

                      // Split and sort
                      const nonPrivileged = code.permissions
                        .filter((p) => !p.isPrivileged)
                        .sort((a, b) => a.name.localeCompare(b.name));

                      const privileged = code.permissions
                        .filter((p) => p.isPrivileged)
                        .sort((a, b) => a.name.localeCompare(b.name));

                      const sortedPermissions = [
                        ...nonPrivileged,
                        ...privileged,
                      ];

                      return sortedPermissions.map((perm) => (
                        <div
                          key={perm.name}
                          className="text-sm flex items-center gap-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removePermissionFromCode(code.code, perm.name)
                            }
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
                          </Button>

                          {perm.isPrivileged && (
                            <ShieldAlert className="h-4 w-4 text-error-foreground" />
                          )}

                          <span
                            className="flex-1 min-w-0 truncate"
                            title={perm.name}
                          >
                            {perm.name}
                          </span>

                          <PermissionExplanationTooltip
                            name={perm.name}
                            description={perm.description}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Default token expiry */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Default token expiry
                </span>
                <p className="text-sm">
                  {code.accountDefaultTokenExpirySeconds} seconds
                </p>
              </div>

              {/* Bottom dashed separator */}
              <div className="flex flex-col gap-1 border-t border-dashed border-border pt-4 mt-auto">
                <span className="text-xs font-semibold text-muted-foreground">
                  Expires on
                </span>
                <p className="text-sm font-medium">
                  {formatDate(code.expirationTimestamp)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddPermissionPopver({
  accountCreationCode,
  userCurrentPermissions,
  availablePermissions,
  router,
}: {
  accountCreationCode: string;
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
    const addPermissionToAccountCreationCodeActionResult =
      await addPermissionToAccountCreationCodeAction(
        accountCreationCode,
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

function PermissionExplanationTooltip({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-w-96">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-sm">{description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
