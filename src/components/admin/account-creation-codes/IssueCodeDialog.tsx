"use client";

import { ChangeEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  Clock,
  Dices,
  Plus,
  Shield,
  ShieldAlert,
  Trash,
} from "lucide-react";

import { PermissionData } from "@/src/db/_internal/per-table/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DurationPicker } from "@/src/components/global/DurationPicker";
import { SeparatorWithHeader } from "@/src/components/global/SeparatorWithHeader";
import { AddPermissionPopver } from "@/src/components/global/AddPermissionPopover";
import { Checkbox } from "@/components/ui/checkbox";
import { addAccountCreationCodeAction } from "@/src/actions/per-page/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExpiryUnit } from "@/src/util/duration";

export function IssueCodeDialog({
  availablePermissions,
}: {
  availablePermissions: Record<string, PermissionData>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parameters:
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(3600 * 24 * 3); // 3 days
  const [emailMeWhenUsed, setEmailMeWhenUsed] = useState(false);
  const [defaultTokenExpirySeconds, setDefaultTokenExpirySeconds] = useState(
    3600 * 24 * 7
  ); // 1 week
  const [permissions, setPermissions] = useState<string[]>([]);

  async function createCode() {
    if (loading) return;
    setLoading(true);

    const addAccountCreationCodeActionResult =
      await addAccountCreationCodeAction(
        title,
        email,
        defaultTokenExpirySeconds,
        permissions,
        new Date(Date.now() + expirySeconds * 1000),
        emailMeWhenUsed
      );

    if (!addAccountCreationCodeActionResult.success) {
      toast("Couldn't issue code.", {
        description: addAccountCreationCodeActionResult.errorString,
        icon: <AlertCircleIcon className="w-5 h-5 text-error-foreground" />,
      });
    } else {
      toast("Successfully issued the code.", {
        icon: <CheckCircle2Icon className="w-5 h-5 text-success-foreground" />,
      });
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Issue Account Creation Code
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Issue Account Creation Code</DialogTitle>
        </DialogHeader>

        <p>Allow someone to create a single account on the website.</p>

        <Email value={email} setEmail={setEmail} />
        <Title title={title} setTitle={setTitle} />
        <Expiry
          expirySeconds={expirySeconds}
          setExpirySeconds={setExpirySeconds}
        />
        <EmailMeWhenUsed
          value={emailMeWhenUsed}
          setEmailMeWhenUsed={setEmailMeWhenUsed}
        />
        <Permissions
          // todo this is quite bad and a lazy tempfix.
          availablePermissions={availablePermissions}
          currentPermissions={Object.fromEntries(
            permissions.map((p) => [
              p,
              availablePermissions[p as keyof typeof availablePermissions], // TODO do not do this. what if we have manage access toekns lite? current permissions should not come from available permissions
            ])
          )}
          onPermissionAdded={(permission: string) => {
            setPermissions((prev) => [...prev, permission]);
          }}
          onPermissionRemoved={(permission: string) => {
            setPermissions((prev) => prev.filter((p) => p !== permission));
          }}
        />
        <SeparatorWithHeader header="Default User Settings" />
        <DefaultTokenExpiry
          tokenExpirySeconds={defaultTokenExpirySeconds}
          setTokenExpirySeconds={setDefaultTokenExpirySeconds}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => createCode()}
          >
            Issue Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Email({
  value,
  setEmail,
}: {
  value: string;
  setEmail: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>Email</span>
      <Input
        type="email"
        placeholder="user@example.com"
        value={value}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>
  );
}

function Title({
  title,
  setTitle,
}: {
  title: string;
  setTitle: (v: string) => void;
}) {
  function onTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    if (newTitle.length < 20) {
      setTitle(e.target.value);
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm max-w-45">
      <span>Title (optional)</span>
      <div className="flex items-center gap-2">
        <Input type="text" value={title} onChange={onTitleChange} />
      </div>
    </div>
  );
}

function Expiry({
  expirySeconds,
  setExpirySeconds,
}: {
  expirySeconds: number;
  setExpirySeconds: (seconds: number) => void;
}) {
  function onExpiryChange(seconds: number) {
    setExpirySeconds(seconds);
  }
  return (
    <div className="flex flex-col gap-2 text-sm max-w-45">
      <span>Expires in</span>
      <DurationPicker
        className="text-sm"
        initialDurationSeconds={expirySeconds}
        maxDurationValue={99}
        onDurationChange={onExpiryChange}
        excludedUnits={[
          ExpiryUnit.SECONDS,
          ExpiryUnit.YEARS,
          ExpiryUnit.MONTHS,
        ]}
      />
    </div>
  );
}

function EmailMeWhenUsed({
  value,
  setEmailMeWhenUsed,
}: {
  value: boolean;
  setEmailMeWhenUsed: (b: boolean) => void;
}) {
  return (
    <div className="flex gap-2 text-sm items-center">
      <span>Email me when account is created?</span>
      <Checkbox
        checked={value}
        onCheckedChange={(checked) => setEmailMeWhenUsed(!!checked)}
      />
    </div>
  );
}

function PermissionsFirstRow({
  currentPermissions,
  availablePermissions,
  onPermissionAdded,
}: {
  currentPermissions: string[];
  availablePermissions: Record<string, PermissionData>;
  onPermissionAdded: (permission: string) => void;
}) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <SeparatorWithHeader
        header="Permissions"
        Icon={Shield}
        showBorder={false}
      />
      <AddPermissionPopver
        availablePermissions={availablePermissions}
        currentPermissions={currentPermissions}
        onPermissionAdded={onPermissionAdded}
      />
    </div>
  );
}

function Permissions({
  currentPermissions,
  availablePermissions,
  onPermissionAdded,
  onPermissionRemoved,
}: {
  currentPermissions: Record<string, PermissionData>;
  availablePermissions: Record<string, PermissionData>;
  onPermissionAdded: (permission: string) => void;
  onPermissionRemoved: (permission: string) => void;
}) {
  return (
    <div>
      <PermissionsFirstRow
        availablePermissions={availablePermissions}
        currentPermissions={Object.keys(currentPermissions)}
        onPermissionAdded={onPermissionAdded}
      />
      <div className="flex flex-col gap-1">
        {Object.keys(currentPermissions).length === 0 ? (
          <span className="text-sm text-muted-foreground">None</span>
        ) : (
          [...Object.keys(currentPermissions)]
            // Show non-privileged permissions first, then sort alphabetically
            .sort((a, b) => {
              if (
                currentPermissions[a].isPrivileged !==
                currentPermissions[b].isPrivileged
              )
                return currentPermissions[a].isPrivileged ? 1 : -1;
              return a.localeCompare(b);
            })
            .map((permission) => (
              <Permission
                permission={permission}
                permissionData={currentPermissions[permission]}
                onPermissionRemoved={onPermissionRemoved}
              />
            ))
        )}
      </div>
    </div>
  );
}

function Permission({
  permission,
  permissionData,
  onPermissionRemoved,
}: {
  permission: string;
  permissionData: PermissionData;
  onPermissionRemoved: (permission: string) => void;
}) {
  return (
    <div key={permission} className="flex items-center gap-1 text-sm">
      <Button
        variant="outline"
        size="sm"
        className="mr-1"
        onClick={() => onPermissionRemoved(permission)}
      >
        <Trash className="w-4 h-4 text-muted-foreground" />
      </Button>

      {permissionData.isPrivileged && (
        <ShieldAlert className="w-4 h-4 text-error-foreground" />
      )}

      <span className="flex-1 truncate">{permission}</span>
    </div>
  );
}

function DefaultTokenExpiry({
  tokenExpirySeconds,
  setTokenExpirySeconds,
}: {
  tokenExpirySeconds: number;
  setTokenExpirySeconds: (seconds: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 text-sm max-w-45">
      <span>Default access token expiry</span>
      <DurationPicker
        className="text-sm"
        initialDurationSeconds={tokenExpirySeconds}
        onDurationChange={setTokenExpirySeconds}
        excludedUnits={[
          ExpiryUnit.SECONDS,
          ExpiryUnit.YEARS,
          ExpiryUnit.MONTHS,
        ]}
      />
    </div>
  );
}
