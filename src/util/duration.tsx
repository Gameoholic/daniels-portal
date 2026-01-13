export enum ExpiryUnit {
  SECONDS = "Second",
  MINUTES = "Minute",
  HOURS = "Hour",
  DAYS = "Day",
  MONTHS = "Month",
  YEARS = "Year",
}

interface ExpiryThreshold {
  //   Max seconds possible for this unit
  maxSeconds: number;
  unit: ExpiryUnit;
}

export const EXPIRY_THRESHOLDS: ExpiryThreshold[] = [
  { maxSeconds: 60, unit: ExpiryUnit.SECONDS },
  { maxSeconds: 60 * 60, unit: ExpiryUnit.MINUTES },
  {
    maxSeconds: 60 * 60 * 24,
    unit: ExpiryUnit.HOURS,
  },
  {
    maxSeconds: 60 * 60 * 24 * 30,
    unit: ExpiryUnit.DAYS,
  },
  {
    maxSeconds: 60 * 60 * 24 * 30 * 12,
    unit: ExpiryUnit.MONTHS,
  },
];

/**
 * Returns how many seconds there are in the given unit.
 */
export function getAmountOfSecondsInUnit(unit: ExpiryUnit) {
  // We get the index of this unit
  let expiryUnitIndexInArray = EXPIRY_THRESHOLDS.findIndex(
    (x) => x.unit == unit
  );
  // If it doesn't exist in array it means it's YEARS, we set it to the highest index + 1 on purpose
  if (expiryUnitIndexInArray == -1) {
    expiryUnitIndexInArray = EXPIRY_THRESHOLDS.length;
  }
  // We divide the seconds by the last index's max seconds to get the number of seconds for this unit. Example: Amount of 12 days -> Total seconds / (12 * 60 * 60 * 24) = 12
  return EXPIRY_THRESHOLDS[expiryUnitIndexInArray - 1]?.maxSeconds ?? 1; // If we are already at index 0 (seconds) we will return 1 otherwise it's -1 index
}

/**
 * Given a unit and value, return the total amount of seconds.
 */
export function getSeconds(unit: ExpiryUnit, value: number) {
  return value * getAmountOfSecondsInUnit(unit);
}
