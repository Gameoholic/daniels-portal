"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  EXPIRY_THRESHOLDS,
  ExpiryUnit,
  getAmountOfSecondsInUnit,
  getSeconds,
} from "@/src/util/duration";
import { useState } from "react";

/**
 * A user friendly UI for getting a duration from the user and converting it to absolute seconds.
 * Note that depending on the min, max and excluded unit values, the value might change from the initial passed value. (but will not call onChange until user interaction)
 * @param initialDuration The initial duration in SECONDS.
 * @param minDurationValue The minimum value (regardless of unit). Default 1.
 * @param maxDurationValue The maximum value (regardless of unit). Default 99.
 * @param excludedUnits Units to not include in this.
 */
export function DurationPicker({
  initialDurationSeconds,
  minDurationValue = 1,
  maxDurationValue = 99,
  excludedUnits = [],
  onDurationChange,
  disabled = false,
  className,
}: {
  initialDurationSeconds: number;
  minDurationValue?: number;
  maxDurationValue?: number;
  excludedUnits?: ExpiryUnit[];
  onDurationChange?: (seconds: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  // GET INITIAL TIME UNIT AND VALUE BASED OFF OF TOTAL SECONDS
  // We are given an initial amount of seconds, so we get the most appropriate unit to represent it
  if (excludedUnits.length >= Object.keys(ExpiryUnit).length) {
    console.error("All units are excluded!");
    return <></>;
  }
  let initialExpiryUnit =
    EXPIRY_THRESHOLDS.find((x) => initialDurationSeconds < x.maxSeconds)
      ?.unit ?? ExpiryUnit.YEARS; // If it's any value above 12 months, we just use years

  // The unit we found might be excluded. In that case, we will keep going down by units until we find one that's not included. If we go to the very start and it's all excluded, we reverse the direction and start going up.
  let decreasingUnitIndex = true; // Prioritize decreasing the unit first (if we have 2 months and months is excluded, we go down to days and so on)
  while (excludedUnits.includes(initialExpiryUnit)) {
    let unitIndex = Object.values(ExpiryUnit).findIndex(
      (x) => x === initialExpiryUnit
    );
    // If we reached the lowest possible unit, start going up
    if (unitIndex == 0) {
      decreasingUnitIndex = false;
    }
    // If we reached the highest possible unit by going up, stop
    if (initialExpiryUnit == ExpiryUnit.YEARS && !decreasingUnitIndex) {
      break;
    }
    unitIndex += decreasingUnitIndex ? -1 : 1;
    initialExpiryUnit = Object.values(ExpiryUnit)[unitIndex];
  }

  // The passed value could be non-divisible by the unit's seconds so we round it. It could also be rounded down as a result or the opposite so we clamp it.
  const initialExpiryValue = Math.min(
    maxDurationValue,
    Math.max(
      minDurationValue,
      Math.floor(
        initialDurationSeconds / getAmountOfSecondsInUnit(initialExpiryUnit)
      )
    )
  );

  const [unit, setUnit] = useState<ExpiryUnit>(initialExpiryUnit);
  const [value, setValue] = useState<number>(initialExpiryValue);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        className={`w-[${
          70 + maxDurationValue.toString().length * 10 - 20
        }px] text-center`}
        value={value}
        disabled={disabled}
        onChange={(newValue) => {
          const num = Math.min(
            maxDurationValue,
            Math.floor(
              Math.max(1, Number(newValue.target.value) || minDurationValue)
            )
          );
          setValue(num);
        }}
        onBlur={() => {
          if (onDurationChange) {
            onDurationChange(getSeconds(unit, value));
          }
        }}
      ></Input>
      <Select
        value={unit}
        disabled={disabled}
        onValueChange={(newUnit: string) => {
          const newUnitCast = newUnit as ExpiryUnit;
          setUnit(newUnitCast);
          if (onDurationChange) {
            onDurationChange(getSeconds(newUnitCast, value));
          }
        }}
      >
        <SelectTrigger className="w-25">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ExpiryUnit)
            .filter((x) => !excludedUnits.includes(x))
            .map((x) => (
              <SelectItem key={x} value={x} className={className}>
                {value == 1 ? x : x + "s"}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Yeah this component was pain. Took like 2-3 hours to get it perfect.
