"use client";

import { LogOut, CheckCircle2Icon, AlertCircleIcon } from "lucide-react"; // https://lucide.dev/icons/
import { logUserOut } from "@/src/actions/user-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LogOutButton() {
  const router = useRouter();

  async function logOut() {
    const result = await logUserOut();
    if (result.success) {
      router.push("/");
      toast("Logged out", {
        description: "Successfully logged out on this device.",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Failed to log out.", {
        description: result.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
  }

  return (
    <div className="text-error-foreground">
      <button
        className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md w-full`}
        onClick={logOut}
      >
        <LogOut className="h-5 w-5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}
