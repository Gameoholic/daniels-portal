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
import { ClientExpense } from "../../utils/client_types";
import { Landmark, Info, HandCoins, Pencil, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function Expenses({ expenses }: { expenses: ClientExpense[] }) {
  const SortAscending = true;
  // Expenses sorted by a value, grouped by a different value
  const groupedExpenses: Record<string, ClientExpense[]> = expenses
    .sort((expense1, expense2) =>
      SortAscending
        ? expense2.timestamp.getTime() - expense1.timestamp.getTime() // We sort by this value
        : expense1.timestamp.getTime() - expense2.timestamp.getTime()
    )
    .reduce((accumulator: Record<string, ClientExpense[]>, currentExpense) => {
      const dateString = ConvertDateToString(currentExpense.timestamp); // We group by this value
      accumulator[dateString] = accumulator[dateString]
        ? [...accumulator[dateString], currentExpense]
        : [currentExpense];
      return accumulator;
    }, {});

  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Expenses</p>

      <div className="grid grid-cols-2 gap-4">
        {ExpenseHistoryCard(groupedExpenses)}
      </div>
    </div>
  );
}

function ConvertDateToString(date: Date) {
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  if (
    date.getFullYear() == now.getFullYear() &&
    date.getMonth() == now.getMonth() &&
    date.getDate() == now.getDate()
  ) {
    return "Today";
  } else if (
    date.getFullYear() == yesterday.getFullYear() &&
    date.getMonth() == yesterday.getMonth() &&
    date.getDate() == yesterday.getDate()
  ) {
    return "Yesterday";
  }
  return new Intl.DateTimeFormat("en-IL", { dateStyle: "long" }).format(date);
}

function ConvertDayOfWeekToString(day: number) {
  return (
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][day] ?? "Unknown"
  );
}

function ExpenseHistoryCard(groupedExpenses: Record<string, ClientExpense[]>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardDescription>
          {/* Todo: buttons for sorting etc. */}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
          <div key={date}>{ExpensesGroupedByDateCard(date, dateExpenses)}</div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExpensesGroupedByDateCard(
  date: string,
  dateExpenses: ClientExpense[]
) {
  return (
    <Card className="mb-10 py-0 gap-0 px-0 border-0 border-b-5 rounded-xs">
      <CardHeader className="p-0 gap-0">
        <CardTitle className="font-bold">
          {/* Date string + tooltip for date formatted with numbers */}
          {
            <Tooltip>
              <TooltipTrigger>{date}</TooltipTrigger>
              <TooltipContent>
                <p>
                  {ConvertDayOfWeekToString(dateExpenses[0].timestamp.getDay())}
                  {" • "}
                  {new Intl.DateTimeFormat("en-IL", {
                    dateStyle: "short",
                  }).format(dateExpenses[0].timestamp)}
                </p>
              </TooltipContent>
            </Tooltip>
          }
          {/* Date string + tooltip for date formatted with numbers */}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {dateExpenses.map((expense) => (
          // The following is the card for an individual expense
          <div key={expense.id}>{ExpenseCard(expense)}</div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExpenseCard(expense: ClientExpense) {
  return (
    <Card className="border-2 border-dashed rounded-2xl my-3 gap-0">
      {/* Top right icons */}
      <CardHeader className="flex p-0 m-0 justify-end gap-3 mr-5">
        <HoverCard key={expense.id} openDelay={50} closeDelay={50}>
          <HoverCardTrigger>
            <Info className="h-5 w-5 text-accent-foreground" />
          </HoverCardTrigger>
          {/* Hoverable extra info for expense */}
          <HoverCardContent className="bg-foreground rounded-2xl w-max max-w-400">
            <p className="text-background">{expense.title}</p>
            <p className="text-xs text-muted-foreground mb-2">
              {ConvertDayOfWeekToString(expense.timestamp.getDay())}
              {" • "}
              {new Date(expense.timestamp).toLocaleString("en-il")}
            </p>
            {/* All expense fields */}
            <div className="text-sm text-background">
              <p>
                <span className="font-semibold">Amount: </span>
                <span className="tracking-tighter">₪ </span>23
              </p>
              <p>
                <span className="font-semibold">Description: </span>
                {expense.description || "—"}
              </p>
              <p>
                <span className="font-semibold">Category: </span>
                {expense.category || "—"}
              </p>
              <p>
                <span className="font-semibold">Payment Method: </span>
                {expense.paymentMethod || "—"}
              </p>
              <p>
                <span className="font-semibold">
                  {expense.reimbursementIncomeIds.length > 0
                    ? "Reimbursement ID: " + expense.reimbursementExpectedAmount
                    : "Reimbursement: "}
                </span>
                {expense.reimbursementIncomeIds ||
                expense.reimbursementExpectedAmount
                  ? "Pending."
                  : "—"}
              </p>
              <p>
                <span className="font-semibold">Subscription: </span>
                {expense.subscriptionId || "—"}
              </p>
              <p>
                <span className="font-semibold">ID: </span>
                {expense.id || "—"}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard key={expense.id + 1} openDelay={50} closeDelay={50}>
          <HoverCardTrigger>
            <HandCoins className="h-5 w-5 text-money-foreground" />
          </HoverCardTrigger>
          {/* Hoverable reimbursement info for expense */}
          <HoverCardContent className="bg-foreground rounded-2xl w-max max-w-400">
            <p className="text-background">Reimbursement Info</p>
            <p className="text-xs text-muted-foreground mb-2">
              PENDING REIMBURSEMENT
            </p>
            <div className="text-sm text-background">
              <p>
                <span className="font-semibold">Notes: </span>
                {expense.description || "—"}
              </p>
              <p>
                <span className="font-semibold">
                  $10/100 Amount reimbursed:{" "}
                </span>
                {expense.description || "—"}
              </p>
              <p>
                <span className="font-semibold">Reimbursement IDs: </span>
                {expense.paymentMethod || "—"}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <Pencil className="h-5 w-5 text-accent-foreground" />
      </CardHeader>
      {/* Top right icons */}
      <CardContent className="flex items-center justify-between py-4">
        {/* Left side */}
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className="bg-accent rounded-full p-3">
            <Landmark className="h-5 w-5 text-accent-foreground" />
          </div>
          {/* Title + Description + Time */}
          <div className="flex flex-col">
            <span className="font- text-[15px]">{expense.title}</span>
            <span className="text-sm text-muted-foreground">
              {expense.description}
            </span>
            <span className="text-xs text-muted-foreground">
              {expense.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="text-[16px]">
          - <span className="tracking-tighter">₪ </span>
          5,532
        </div>
      </CardContent>
    </Card>
  );
}
