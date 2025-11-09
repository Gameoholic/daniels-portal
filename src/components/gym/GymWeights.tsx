"use client";

import {
  TrendingUp,
  Plus,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths } from "date-fns";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/custom/card";
import { ClientGymWeight } from "@/src/utils/client_types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { addGymWeightAction, deleteGymWeightAction } from "@/src/actions/gym";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function GymWeights({
  weights,
  loading,
  errorString,
}: {
  weights: ClientGymWeight[];
  loading: boolean;
  errorString: string;
}) {
  if (!weights || loading || errorString) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Body Weight History</CardTitle>
        </CardHeader>

        <CardContent>
          <Skeleton
            className="size-50 rounded-md"
            data-sidebar="menu-skeleton-icon"
          />
        </CardContent>

        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 leading-none font-medium">
            Weight tracking <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing all logged entries
          </div>
        </CardFooter>
      </Card>
    );
  }

  const data = weights
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    .map((w) => ({
      date: w.timestamp.getTime(),
      label: new Date(w.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: w.amount,
    }));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Body Weight History</CardTitle>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-secondary"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <AddWeightDialog />
        </Dialog>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data} margin={{ top: 20, left: 20, right: 20 }}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="date"
              type="number"
              scale="time"
              domain={["auto", "auto"]}
              tickFormatter={(ts) =>
                new Date(ts).toLocaleDateString("en-US", {
                  year: "2-digit",
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 2", "dataMax + 2"]}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />

            <Line
              dataKey="weight"
              type="natural"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={<DotWithDeleteDialog />}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Placeholder: %5 <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Placeholder</div>
      </CardFooter>
    </Card>
  );
}

export function AddWeightDialog() {
  const router = useRouter();
  const [date, setDate] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight || !date) return;

    setLoading(true);
    // todo: what happens if we pass faulty parameters here? (remove the clientside checks)
    const gymWeight: ClientGymWeight = {
      amount: parseFloat(weight),
      timestamp: new Date(date),
    };
    const gymWeightActionResult = await addGymWeightAction(gymWeight);

    if (gymWeightActionResult.success) {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      toast("Weight added", {
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
      router.refresh(); // Reload data
    } else {
      toast("Failed to add weight", {
        description: gymWeightActionResult.errorString || "Unknown error.",
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
    setLoading(false);
  }

  return (
    <DialogContent className="max-w-sm">
      <form onSubmit={handleSubmit}>
        <DialogHeader className="mb-3">
          <DialogTitle>Add Weight Entry</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Weight input */}
          <div className="grid gap-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="text"
              inputMode="decimal"
              placeholder=""
              value={weight}
              onChange={(e) => {
                const floatRegex = /^(\d+(\.\d*)?|\.\d*)?$/;
                if (floatRegex.test(e.target.value)) {
                  setWeight(e.target.value);
                }
              }}
              required
            />
          </div>

          {/* Date input */}
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <DialogFooter className="mt-4 items-center flex gap-2">
          {loading && <Spinner className="w-5 h-5 mr-2" />}
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function DotWithDeleteDialog(props: any) {
  const { cx, cy, payload } = props;
  return (
    <DeleteWeightDialog weight={payload}>
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="var(--chart-1)"
        style={{ cursor: "pointer" }}
      />
    </DeleteWeightDialog>
  );
}

interface DeleteWeightDialogProps {
  weight: ClientGymWeight;
  children: React.ReactNode;
}

export function DeleteWeightDialog({
  weight,
  children,
}: DeleteWeightDialogProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteGymWeightAction(weight);
    if (result.success) {
      toast("Weight deleted");
      router.refresh();
    } else {
      toast("Failed to delete weight", { description: result.errorString });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Weight Entry</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete the weight {weight.amount} kg recorded
          on {new Date(weight.timestamp).toLocaleDateString()}?
        </p>
        <DialogFooter className="mt-4 flex gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleDelete} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
