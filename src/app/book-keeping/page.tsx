"use client";

import {
  Landmark,
  HandCoins,
  PiggyBank,
  BanknoteArrowUp,
  CircleDollarSign,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/custom-shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function CurrentBalanceCard() {
  return (
    <Card className="py-3">
      <CardHeader>
        <CardTitle>Current Balance</CardTitle>
        <CardDescription className="font-bold text-2xl ">
          <span className="tracking-tighter">₪ </span>5,532
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Select defaultValue="just-bank">
          <SelectTrigger className="min-w-1 max-w-full w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="just-bank">
              <Landmark className="mr-1 h-5 w-5 " />
              Just bank account
            </SelectItem>
            <SelectItem value="just-cash">
              <HandCoins className="mr-1 h-5 w-5 " />
              Just cash
            </SelectItem>
            <SelectItem value="total-money">
              <PiggyBank className="mr-1 h-5 w-5 " />
              Total money available (Bank+Cash)
            </SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
}
function InvestmentsCard() {
  return (
    <Card className="py-3">
      <CardHeader>
        <CardTitle>Investments</CardTitle>
        <CardDescription className="font-bold text-2xl ">
          <span className="tracking-tighter">₪ </span>5,532
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="gap-2">
        <Select defaultValue="total-if-liquidated">
          <SelectTrigger className="min-w-1 max-w-full w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="originally-invested">
              <PiggyBank className="mr-1 h-5 w-5 " />
              Originally invested
            </SelectItem>
            <SelectItem value="total-if-liquidated">
              <CircleDollarSign className="mr-1 h-5 w-5 " />
              Total if liquidated
            </SelectItem>
            <SelectItem value="profit">
              <BanknoteArrowUp className="mr-1 h-5 w-5 " />
              Profit
            </SelectItem>
          </SelectContent>
        </Select>
        <Checkbox />
        <span className="text-nowrap">Factor Tax</span>
      </CardFooter>
    </Card>
  );
}

function ExpensesCard() {
  return (
    <Card className="py-3">
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription className="font-bold text-2xl ">
          <span className="tracking-tighter">₪ </span>5,532
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
function IncomeCard() {
  return (
    <Card className="py-3">
      <CardHeader>
        <CardTitle>Income</CardTitle>
        <CardDescription className="font-bold text-2xl ">
          <span className="tracking-tighter">₪ </span>5,532
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  // const a = await requestGetExpenses();

  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Overview</p>

      <div className="grid grid-cols-4 gap-4">
        <CurrentBalanceCard />
        <InvestmentsCard />
        <ExpensesCard />
        <IncomeCard />
      </div>
    </div>
  );
}
