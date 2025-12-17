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
import { getGymWeightsAction } from "@/src/actions/gym";
import GymWeights from "@/src/components/gym/GymWeights";

function Weights() {
  return (
    <section>
      <Suspense
        fallback={
          <GymWeights weights={[]} loading={true} errorString=""></GymWeights>
        }
      >
        <GymWeightsLoader />
      </Suspense>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Overview</p>

      <div className="grid grid-cols-4 gap-4">
        <Weights />
      </div>
    </div>
  );
}

export async function GymWeightsLoader() {
  const weights = await getGymWeightsAction();
  //await new Promise((resolve) => setTimeout(resolve, 500));
  return (
    <GymWeights
      weights={weights.success ? weights.result : []}
      loading={false}
      errorString={weights.success ? "" : weights.errorString}
    />
  );
}
