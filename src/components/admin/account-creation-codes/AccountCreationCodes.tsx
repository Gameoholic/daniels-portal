"use client";

import { useState } from "react";

import {
  addPermissionToAccountCreationCodeAction,
  addUserPermissionAction,
  AdminActions_GetAccountCreationCodes_Result,
  removePermissionFromAccountCreationCodeAction,
  revokeAccountCreationCodeAction,
} from "@/src/actions/per-page/admin";
import SensitiveComponent from "@/src/components/global/SensitiveComponent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PermissionData } from "@/src/db/_internal/per-table/permissions";
import { addPermissionToAccountCreationCode } from "@/src/db/_internal/per-table/account-creation-codes";
import {
  Dialog,
  DialogFooter,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { displayDateInFullFormat } from "@/src/util/date";
import { Checkbox } from "@/components/ui/checkbox";
import { CodePanel } from "@/src/components/admin/account-creation-codes/CodeCard";
import { Plus, UserPlus } from "lucide-react";
import { IssueCodeDialog } from "./IssueCodeDialog";

export default function AccountCreationCodes({
  accountCreationCodes,
  availablePermissions,
  loading,
  errorString,
}: {
  accountCreationCodes: AdminActions_GetAccountCreationCodes_Result[] | null;
  availablePermissions: Record<string, PermissionData>;
  loading: boolean;
  errorString: string;
}) {
  if (loading || accountCreationCodes == null) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading account creation codes…
      </div>
    );
  }

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string>("");

  const filteredCodes = accountCreationCodes.filter((code) => {
    const q = search.toLowerCase();
    return (
      code.email.toLowerCase().includes(q) ||
      code.code.toLowerCase().includes(q)
    );
  });

  const sortedCodes = filteredCodes.sort(
    (a, b) =>
      new Date(b.expirationTimestamp).getTime() -
      new Date(a.expirationTimestamp).getTime()
  );

  return (
    <div className="p-6">
      <p className="font-semibold text-2xl mb-2">Account Creation Codes</p>

      {/* Search */}
      <div className="flex justify-between mb-6 gap-20">
          <input
            type="text"
            placeholder="Search by code or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg border border-border
                      focus:outline-none focus:ring-2 focus:ring-accent
                      focus:border-accent transition-colors"
          />

        <IssueCodeDialog availablePermissions={availablePermissions} onSubmit={async () => {}}/>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedCodes.map((code) => (
          <CodePanel
            code={code}
            router={router}
            availablePermissions={availablePermissions}
          />
        ))}
      </div>
    </div>
  );
}
