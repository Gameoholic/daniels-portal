"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AdminActions_GetAccountCreationCodes_Result,
  AdminActions_GetAccountCreationCodes_Result_Permission,
  updateAccountCreationCodeAccountDefaultTokenExpiryAction,
  updateAccountCreationCodeOnUsedEmailCreatorAction,
} from "@/src/actions/per-page/admin";
import { AddPermissionPopver } from "@/src/components/admin/account-creation-codes/AddPermissionPopover";
import SensitiveComponent from "@/src/components/global/SensitiveComponent";
import {
  displayDateInEnglishFormat,
  displayDateInFullFormat,
  ifDisplayDateIsInEnglishWillItBeRelative,
} from "@/src/util/date";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PermissionData } from "@/src/db/_internal/per-table/permissions";
import Link from "next/link";
import { useState } from "react";
import {
  Shield,
  Mail,
  Clock,
  Trash2,
  ShieldAlert,
  Terminal,
  UserStar,
  Trash,
  AlertCircleIcon,
  CheckCircle2Icon,
  CircleQuestionMark,
  ClockPlus,
  MailWarning,
} from "lucide-react";

import {
  removePermissionFromAccountCreationCodeAction,
  revokeAccountCreationCodeAction,
} from "@/src/actions/per-page/admin";
import { toast } from "sonner";
import { SeparatorWithHeader } from "@/src/components/global/SeparatorWithHeader";
import { Date } from "@/src/components/global/Date";
import { DurationPicker } from "@/src/components/global/DurationPicker";
import { ExpiryUnit } from "@/src/util/duration";

export function CodePanel({
  code,
  router,
  availablePermissions,
}: {
  code: AdminActions_GetAccountCreationCodes_Result;
  router: AppRouterInstance;
  availablePermissions: Record<string, PermissionData>;
}) {
  const [loading, setLoading] = useState(false);

  async function removePermissionFromCode(
    code: string,
    permissionToRemove: string
  ) {
    if (loading) return;
    setLoading(true);

    const res = await removePermissionFromAccountCreationCodeAction(
      code,
      permissionToRemove
    );

    if (!res.success) {
      toast("Couldn't remove the permission.", {
        description: res.errorString,
        icon: <AlertCircleIcon className="w-5 h-5 text-error-foreground" />,
      });
    } else {
      toast("Successfully removed the permission.", {
        icon: <CheckCircle2Icon className="w-5 h-5 text-success-foreground" />,
      });
      router.refresh();
    }

    setLoading(false);
  }

  async function revokeCode(code: string) {
    if (loading) return;
    setLoading(true);

    const res = await revokeAccountCreationCodeAction(code);

    if (!res.success) {
      toast("Couldn't revoke the code.", {
        description: res.errorString,
        icon: <AlertCircleIcon className="w-5 h-5 text-error-foreground" />,
      });
    } else {
      toast("Successfully revoked the code.", {
        icon: <CheckCircle2Icon className="w-5 h-5 text-success-foreground" />,
      });
      router.refresh();
    }

    setLoading(false);
  }

  async function updateDefaultTokenExpiry(seconds: number) {
    if (loading) return;
    setLoading(true);

    const res = await updateAccountCreationCodeAccountDefaultTokenExpiryAction(
      code.id,
      seconds
    );

    if (!res.success) {
      toast("Couldn't update the default token expiry.", {
        description: res.errorString,
        icon: <AlertCircleIcon className="w-5 h-5 text-error-foreground" />,
      });
    } else {
      toast("Successfully updated the default token expiry", {
        icon: <CheckCircle2Icon className="w-5 h-5 text-success-foreground" />,
      });
      router.refresh();
    }

    setLoading(false);
  }

  async function updateEmailCreatorWhenUsed(emailCreator: boolean) {
    if (loading) return;
    setLoading(true);

    const res = await updateAccountCreationCodeOnUsedEmailCreatorAction(
      code.id,
      emailCreator
    );

    if (!res.success) {
      toast("Couldn't update the email setting.", {
        description: res.errorString,
        icon: <AlertCircleIcon className="w-5 h-5 text-error-foreground" />,
      });
    } else {
      toast("Successfully updated the email setting.", {
        icon: <CheckCircle2Icon className="w-5 h-5 text-success-foreground" />,
      });
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <Title />
        <RevokeButton />
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Email />
        <Creator />
        <CreationDate />
        <EmailCreatorWhenUsed />
        <Permissions />
        <DefaultUserSettings loading={loading} />
      </CardContent>

      <CardFooter className="border-t-2 border-dashed">
        <BottomMostSection />
      </CardFooter>
    </Card>
  );

  function Title() {
    return (
      <div>
        <SeparatorWithHeader showBorder={false} header="Code" Icon={Terminal} />
        <p className="font-mono font-semibold break-all text-xl">
          {code.title || code.id}
        </p>
      </div>
    );
  }
  function RevokeButton() {
    return (
      <Button
        variant="ghost"
        className="text-destructive"
        onClick={() => revokeCode(code.id)}
      >
        <Trash2 className="w-4 h-4" />
        Revoke
      </Button>
    );
  }
  function Email() {
    return (
      <div className="flex flex-col gap-1">
        <SeparatorWithHeader showBorder={false} header="Email" Icon={Mail} />
        <SensitiveComponent
          secureLength={code.email.length}
          iconSize={4}
          blurredTextSize="text-sm"
        >
          <p className="text-sm">{code.email}</p>
        </SensitiveComponent>
      </div>
    );
  }
  function Creator() {
    return (
      <div className="flex flex-col">
        <SeparatorWithHeader
          showBorder={false}
          header="Issued by"
          Icon={UserStar}
        />
        <Link
          href={`/admin/user-management/${code.creatorUserId}`}
          className="text-sm hover:bg-muted rounded-xl p-1 mt-1"
        >
          {code.creatorUsername}
        </Link>
      </div>
    );
  }
  function CreationDate() {
    return (
      <div>
        <SeparatorWithHeader
          showBorder={false}
          header={
            ifDisplayDateIsInEnglishWillItBeRelative(code.creationTimestamp)
              ? "Issued"
              : "Issued on"
          }
          Icon={ClockPlus}
        />
        <Date date={code.creationTimestamp} className="text-sm font-medium" />
      </div>
    );
  }

  function EmailCreatorWhenUsed() {
    return (
      <div className="flex flex-col">
        <SeparatorWithHeader
          showBorder={false}
          header={`Email ${code.creatorUsername} when account is created?`}
          Icon={MailWarning}
          className="mb-2"
        />
        <Checkbox
          disabled={loading}
          checked={code.onUsedEmailCreator}
          onCheckedChange={(checked) => updateEmailCreatorWhenUsed(!!checked)}
        ></Checkbox>
      </div>
    );
  }

  function Permissions() {
    return (
      <div>
        <PermissionsFirstRow />
        <div className="flex flex-col gap-1">
          {code.permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">None</p>
          ) : (
            [...code.permissions]
              // Show non-privileged permissions first, then sort alphabetically
              .sort((a, b) => {
                if (a.isPrivileged !== b.isPrivileged)
                  return a.isPrivileged ? 1 : -1;
                return a.name.localeCompare(b.name);
              })
              .map((permission) => <Permission permission={permission} />)
          )}
        </div>
      </div>
    );
  }

  function PermissionsFirstRow() {
    return (
      <div className="flex items-center justify-between text-muted-foreground">
        <SeparatorWithHeader
          header="Permissions"
          Icon={Shield}
          showBorder={false}
        />
        <AddPermissionPopver
          availablePermissions={availablePermissions}
          router={router}
          userCurrentPermissions={code.permissions.map((x) => x.name)}
          accountCreationCodeId={code.id}
        />
      </div>
    );
  }

  function Permission({
    permission,
  }: {
    permission: AdminActions_GetAccountCreationCodes_Result_Permission;
  }) {
    return (
      <div key={permission.name} className="flex items-center gap-1 text-sm">
        <Button
          variant="outline"
          size="sm"
          className="mr-1"
          disabled={loading}
          onClick={() => removePermissionFromCode(code.id, permission.name)}
        >
          <Trash className="w-4 h-4 text-muted-foreground" />
        </Button>

        {permission.isPrivileged && (
          <ShieldAlert className="w-4 h-4 text-error-foreground" />
        )}

        <span className="flex-1 truncate">{permission.name}</span>

        <PermissionExplanationTooltip />
      </div>
    );

    function PermissionExplanationTooltip() {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleQuestionMark className="w-5 h-5 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-96">
              <p className="text-sm font-semibold">{permission.name}</p>
              <p className="text-sm">{permission.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    }
  }
  function DefaultUserSettings({ loading }: { loading: boolean }) {
    return (
      <div>
        <SeparatorWithHeader header="Default User Settings" />
        <div className="flex flex-col gap-2 mt-2">
          <TokenExpiry />
        </div>
      </div>
    );

    function TokenExpiry() {
      return (
        <div>
          <SeparatorWithHeader
            header="Access token expiry"
            showBorder={false}
            Icon={Clock}
            className="mb-2"
          />
          <DurationPicker
            className="text-sm"
            disabled={loading}
            initialDurationSeconds={code.accountDefaultTokenExpirySeconds}
            onDurationChange={updateDefaultTokenExpiry}
            excludedUnits={[
              ExpiryUnit.SECONDS,
              ExpiryUnit.YEARS,
              ExpiryUnit.MONTHS,
            ]}
          />
        </div>
      );
    }
  }

  function BottomMostSection() {
    return (
      <div className="mt-2 gap-2">
        <ExpiresOn />
      </div>
    );
    function ExpiresOn() {
      return (
        <div>
          <SeparatorWithHeader showBorder={false} header="Expires on" />
          <Date
            date={code.expirationTimestamp}
            className="text-sm font-medium"
          />
        </div>
      );
    }
  }
}
