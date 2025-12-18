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
  ClientAccessToken,
  ClientExpense,
  ClientUser,
} from "../../utils/client_types";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ReactNode, useState } from "react";
import SensitiveComponent from "../custom/sensitive-component";
import {
  changeDefaultTokenExpiry,
  invalidateSelfAccessToken,
  logUserOut,
} from "@/src/actions/user-actions";
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

export default function AdvancedSettings({
  user,
  loading,
  errorString,
}: {
  user: ClientUser | null;
  loading: boolean;
  errorString: string;
}) {
  if (loading) {
    return <div>todo skeletons here</div>;
  }
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Advanced Security Settings</p>
      <p className="font-semibold text-1xl">Account Details</p>
      <DefaultTokenExpiryComponent
        currentExpirySeconds={user?.defaultTokenExpirySeconds ?? 1}
      />
      <p className="text-muted-foreground">
        Max access tokens at a time: {user?.defaultTokenExpirySeconds}
      </p>
    </div>
  );

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

      const action = await changeDefaultTokenExpiry(
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
          icon: (
            <CheckCircle2Icon className="text-success-foreground w-5 h-5" />
          ),
          duration: 3000,
        });
      }
    }
    return (
      <div className="flex items-center">
        <span className="text-muted-foreground">New token expiry:</span>
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
}
