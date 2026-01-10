"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dice4, Dices, Plus } from "lucide-react";
import { toast } from "sonner";

import { PermissionData } from "@/src/db/_internal/per-table/permissions";

type Props = {
  availablePermissions: Record<string, PermissionData>;
  onSubmit: () => Promise<void>;
};

export function IssueCodeDialog({
  availablePermissions,
  onSubmit,
}: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [expirySeconds, setExpirySeconds] = useState(60 * 60 * 24 * 7);

  const [notify, setNotify] = useState({
    createdUser: true,
    createdCreator: true,
    usedUser: true,
    usedCreator: true,
  });

  async function handleSubmit() {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    await onSubmit();

    toast.success("Account creation code issued");
    setOpen(false);
  }

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
        {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

                {/* Email */}
        <div className="space-y-2">
          <Label>Code</Label>
          <Input
            type="text"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Dices className="h-5 w-5"/>

                {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Expiration */}
        <div className="space-y-2">
          <Label>Token Expiration</Label>
          <Select
            value={String(expirySeconds)}
            onValueChange={(v) => setExpirySeconds(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={String(60 * 60 * 24)}>
                24 hours
              </SelectItem>
              <SelectItem value={String(60 * 60 * 24 * 7)}>
                7 days
              </SelectItem>
              <SelectItem value={String(60 * 60 * 24 * 30)}>
                30 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(availablePermissions).map((perm) => (
              <label
                key={perm}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={permissionIds.includes(perm)}
                  onCheckedChange={(checked) => {
                    setPermissionIds((prev) =>
                      checked
                        ? [...prev, perm]
                        : prev.filter((id) => id !== perm)
                    );
                  }}
                />
                {perm}
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <Label>Email Notifications</Label>
          {[
            ["createdUser", "Email user on creation"],
            ["createdCreator", "Email me on creation"],
            ["usedUser", "Email user on use"],
            ["usedCreator", "Email me on use"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={notify[key as keyof typeof notify]}
                onCheckedChange={(checked) =>
                  setNotify((n) => ({ ...n, [key]: Boolean(checked) }))
                }
              />
              {label}
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>
            Issue Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
