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
import { Clock, Dices, Plus, Shield, ShieldAlert, Trash } from "lucide-react";

import { PermissionData } from "@/src/db/_internal/per-table/permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DurationPicker,
  ExpiryUnit,
} from "@/src/components/global/DurationPicker";
import { SeparatorWithHeader } from "@/src/components/global/SeparatorWithHeader";
import { AddPermissionPopver } from "@/src/components/global/AddPermissionPopover";

export function IssueCodeDialog({
  availablePermissions,
}: {
  availablePermissions: Record<string, PermissionData>;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(3600 * 24 * 3); // 3 days
  const [defaultTokenExpirySeconds, setDefaultTokenExpirySeconds] = useState(
    3600 * 24 * 7
  ); // 1 week
  const [permissions, setPermissions] = useState<string[]>([]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Issue Account Creation Token
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Issue Account Creation Code</DialogTitle>
        </DialogHeader>

        <p>Allow someone to create a single account on the website.</p>

        <Email value={email} setEmail={setEmail} />
        <Code value={code} setCode={setCode} />
        <Expiry
          expirySeconds={expirySeconds}
          setExpirySeconds={setExpirySeconds}
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
          <Button>Issue Code</Button>
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

function Code({
  value,
  setCode,
}: {
  value: string;
  setCode: (v: string) => void;
}) {
  function generateRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCode(result);
  }

  function onCodeChange(e: ChangeEvent<HTMLInputElement>) {
    const newCode = e.target.value.toUpperCase();
    if (
      newCode.length === 0 ||
      (/^[A-Z0-9]+$/.test(newCode) && newCode.length <= 6)
    ) {
      setCode(newCode);
    }
  }

  return (
    <div className="flex flex-col gap-2 text-sm max-w-40">
      <span>Code</span>
      <div className="flex items-center gap-2">
        <Input type="text" value={value} onChange={onCodeChange} />
        <Button variant="ghost" onClick={generateRandomCode}>
          <Dices className="h-5 w-5" />
        </Button>
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
    <DurationPicker
      className="text-sm"
      label="Expires in:"
      initialDurationSeconds={expirySeconds}
      maxDurationValue={99}
      onDurationChange={onExpiryChange}
      excludedUnits={[ExpiryUnit.SECONDS, ExpiryUnit.YEARS, ExpiryUnit.MONTHS]}
    />
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
          <p className="text-sm text-muted-foreground">None</p>
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
    <DurationPicker
      className="text-sm"
      label="Default token expiry:"
      initialDurationSeconds={tokenExpirySeconds}
      onDurationChange={setTokenExpirySeconds}
      excludedUnits={[ExpiryUnit.SECONDS, ExpiryUnit.YEARS, ExpiryUnit.MONTHS]}
    />
  );
}
