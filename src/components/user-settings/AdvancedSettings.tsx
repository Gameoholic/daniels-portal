"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/custom-shadcn/card";

import {
  Landmark,
  Info,
  HandCoins,
  Pencil,
  Trash,
  CircleQuestionMark,
  EyeOff,
  Eye,
  CheckCircle2Icon,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ReactNode, useState } from "react";
import SensitiveComponent from "../custom/sensitive-component";
import { toast } from "sonner";
import { Router, useRouter } from "next/router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  changeDefaultTokenExpiryAction,
  changeMaxTokensAtATimeAction,
  invalidateTokensIfOverMaxAmountAction,
  UserSettingsActions_GetUserAction_Result,
} from "@/src/actions/per-page/user-settings";

export default function AdvancedSettings({
  user,
  tokenAmount,
  loading,
  errorString,
}: {
  user: UserSettingsActions_GetUserAction_Result | null;
  tokenAmount: number | null;
  loading: boolean;
  errorString: string;
}) {
  if (loading) {
    return <div>todo skeletons here</div>;
  }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Advanced Security Settings</p>
      <p className="font-semibold text-1xl">Access Tokens</p>
      {/* todo after handling skeletons remove all the nullibity checks resulting from user? */}
      <DefaultTokenExpiryComponent
        currentExpirySeconds={user?.defaultTokenExpirySeconds ?? 1}
      />
      <MaxAccessTokensAtATimeComponent
        userId={user?.id ?? null}
        currentMaxTokensAtATime={user?.maxTokensAtATime ?? null}
        tokenAmount={tokenAmount!!} // todo we shouldn't even have to do !! if we just sort out the skeleton nullability stuff
      />
    </div>
  );
}

function MaxAccessTokensAtATimeComponent({
  userId,
  currentMaxTokensAtATime,
  tokenAmount,
}: {
  userId: string | null;
  currentMaxTokensAtATime: number | null;
  tokenAmount: number;
}) {
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [enableMaxTokens, setEnableMaxTokens] = useState<boolean>(
    currentMaxTokensAtATime != null
  );
  const [maxTokensAtATime, setMaxTokensAtATime] = useState<number>(
    currentMaxTokensAtATime ?? 1
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function updateMaxTokens(newMaxTokensAtATime: number | null) {
    if (loading) {
      return;
    }
    setLoading(true);

    const changeMaxTokensAction = await changeMaxTokensAtATimeAction(
      newMaxTokensAtATime
    );
    if (newMaxTokensAtATime) {
      const invalidateOldTokensAction =
        await invalidateTokensIfOverMaxAmountAction(newMaxTokensAtATime, false);
      if (!invalidateOldTokensAction.success) {
        setError("Couldn't update max tokens.");
        // for ALL action forms in the website we need to handle errors, so far we don't.
      }
    }
    setLoading(false);

    if (!changeMaxTokensAction.success) {
      setError("Couldn't update max tokens.");
      // for ALL action forms in the website we need to handle errors, so far we don't.
    } else {
      toast("Value updated successfully.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
  }
  return (
    <div className="flex items-center gap-2">
      <span className={"text-muted-foreground"}>
        Max access tokens at a time:
      </span>
      <MaxAccessTokensAtATimeTooltip />

      <Checkbox
        className="ml-3"
        checked={enableMaxTokens}
        disabled={loading || showWarning}
        onCheckedChange={(checked) => {
          setEnableMaxTokens(Boolean(checked));
        }}
      />
      <Input
        className="w-[70px] text-center mr-3"
        value={maxTokensAtATime}
        disabled={loading || !enableMaxTokens || showWarning}
        onChange={(e) => {
          let num = Number(e.target.value) || 1;
          num = Math.min(9, Math.max(1, num));
          setMaxTokensAtATime(num);
        }}
      />

      {/* Display warning if amount of access tokens user has is higher than the max tokens */}
      <DeleteOldAccessTokensWarningWrapper
        displayWarning={maxTokensAtATime < tokenAmount}
        currentTokenAmount={tokenAmount}
        tokensToBeRevoked={tokenAmount - maxTokensAtATime}
        onConfirm={() => {
          setShowWarning(false);
          updateMaxTokens(maxTokensAtATime);
        }}
        onCancel={() => setShowWarning(false)}
      >
        <Button
          disabled={loading || showWarning}
          onClick={() => {
            if (maxTokensAtATime >= tokenAmount) {
              updateMaxTokens(enableMaxTokens ? maxTokensAtATime : null);
            }
          }}
        >
          Save
        </Button>
      </DeleteOldAccessTokensWarningWrapper>
    </div>
  );
}

function DeleteOldAccessTokensWarningWrapper({
  displayWarning,
  currentTokenAmount,
  tokensToBeRevoked,
  onConfirm,
  onCancel,
  children,
}: {
  displayWarning: boolean;
  currentTokenAmount: number;
  tokensToBeRevoked: number;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  if (!displayWarning) return <>{children}</>;
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm max access tokens change</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          You currently have {currentTokenAmount} access tokens, which is higher
          than the max access token amount you set.
          <br />
          <strong>
            Clicking confirm will revoke the {tokensToBeRevoked} oldest token
            {tokensToBeRevoked === 1 ? "" : "s"} automatically.
          </strong>
        </p>

        <DialogFooter className="mt-4 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DefaultTokenExpiryComponent({
  currentExpirySeconds,
}: {
  currentExpirySeconds: number;
}) {
  const expiryThresholds = [
    { maxSeconds: 60, unit: "seconds", divideSecondsBy: 1 },
    { maxSeconds: 60 * 60, unit: "minutes", divideSecondsBy: 60 },
    { maxSeconds: 60 * 60 * 24, unit: "hours", divideSecondsBy: 60 * 60 },
  ];

  const currentExpiryUnit =
    expiryThresholds.find((x) => currentExpirySeconds < x.maxSeconds)?.unit ??
    "days";
  const currentExpiryValue =
    currentExpirySeconds /
    (expiryThresholds.find((x) => x.unit == currentExpiryUnit)
      ?.divideSecondsBy ?? 60 * 60 * 24); // the one for days

  const [expiryUnit, setExpiryUnit] = useState<string>(currentExpiryUnit);
  const [expiryValue, setExpiryValue] = useState<number>(currentExpiryValue);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  async function updateExpiry(newExpiryUnit: string, newExpiryValue: number) {
    if (loading) {
      return;
    }
    setLoading(true);

    const action = await changeDefaultTokenExpiryAction(
      newExpiryValue *
        (expiryThresholds.find((x) => x.unit == newExpiryUnit)
          ?.divideSecondsBy ?? 60 * 60 * 24) // the one for days
    );
    setLoading(false);

    if (!action.success) {
      setError(action.errorString);
      // todo here revert to old value
      // for ALL action forms in the website we need to handle errors, so far we don't.
    } else {
      toast("Value updated successfully.", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
  }
  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2 mr-3">
        <span className="text-muted-foreground">Default token expiry:</span>
        <DefaultTokenExpiryTooltip />
      </div>
      <Input
        className="w-[70px] m-2 text-center"
        value={expiryValue}
        disabled={loading}
        onChange={(e) => {
          let num = Number(e.target.value) || 1;
          num = Math.min(99, Math.max(1, num));
          setExpiryValue(num);
        }}
        // todo: this onBlur is a lazy solution. also if the value doesnt change it still calls onBlur resulting in an unnecessary data update request
        onBlur={() => {
          updateExpiry(expiryUnit, expiryValue);
        }}
      ></Input>
      <Select
        value={expiryUnit}
        onValueChange={(value) => {
          setExpiryUnit(value);
          updateExpiry(value, expiryValue);
        }}
        disabled={loading}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="minutes">Minutes</SelectItem>
          <SelectItem value="hours">Hours</SelectItem>
          <SelectItem value="days">Days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function DefaultTokenExpiryTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            How long do tokens last after creation. After a token expires, you
            will have to generate a new token by logging in with your password.
            (In simpler words—how often you have to enter your password to use
            the website?)
          </p>
          <p className="text-wrap">
            Recommended to choose the shortest duration for security reasons,
            while also considering convenience, so that you won't need to log in
            with your password too frequently.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function MaxAccessTokensAtATimeTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleQuestionMark className="h-5 w-5 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <div className="max-h-50 max-w-100 m-1 space-y-1">
          <p className="text-wrap">
            If enabled, will only allow a certain amount of access tokens to
            exist at any time. Older access tokens will be invalidated by order
            of creation.
          </p>
          <p className="text-wrap">
            Useful if you want to limit your activity to one device at a time.
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
