import {
  Landmark,
  HandCoins,
  PiggyBank,
  BanknoteArrowUp,
  CircleDollarSign,
} from "lucide-react";
import { Suspense } from "react";
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
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TimeManagement from "@/src/components/time-management/TimeManagement";
import {
  getUserActivities,
  getUserActivitySessions,
} from "@/src/actions/per-page/time-management";

function TimeManagementSection() {
  return (
    <section>
      {
        <Suspense fallback={<section></section>}>
          <TimeManagementLoader />
        </Suspense>
      }
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Overview</p>

      <div className="grid grid-cols-4 gap-4">
        <TimeManagementSection />
      </div>
    </div>
  );
}

async function TimeManagementLoader() {
  const getUserActivitiesAction = await getUserActivities();
  const getUserActivitySessionsAction = await getUserActivitySessions();
  if (
    !getUserActivitiesAction.success ||
    !getUserActivitySessionsAction.success
  ) {
    return;
  }
  return (
    <TimeManagement
      activities={getUserActivitiesAction.result}
      activitySessions={getUserActivitySessionsAction.result}
    />
  );
}
