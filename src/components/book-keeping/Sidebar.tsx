"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BanknoteArrowDown,
  Repeat2,
  BanknoteArrowUp,
  Settings,
  MoveLeft,
  DollarSign,
  WalletMinimal,
  HandCoins,
  PiggyBank,
  Album,
  Book,
  LogOut,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react"; // https://lucide.dev/icons/
import { logUserOut } from "@/src/actions/auth";
import { toast } from "sonner";
import { requestDeleteAccessToken } from "@/src/utils/db/auth/db_actions";

const navItems = [
  { href: "/book-keeping/", label: "Dashboard", icon: Home },
  {
    href: "/book-keeping/expenses",
    label: "Expenses",
    icon: BanknoteArrowDown,
  },
  { href: "/book-keeping/income", label: "Income", icon: BanknoteArrowUp },
  {
    href: "/book-keeping/subscriptions",
    label: "Subscriptions",
    icon: Repeat2,
  },
];

export function Sidebar() {
  const pathname = usePathname();
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
    <div className="flex flex-col">
      {/* App title */}
      <div className="flex items-center ml-2 mt-1">
        <Album className="h-5 w-5" />
        <p className="ml-2">Book Keeping</p>
      </div>
      {/* Return home */}
      <Link
        href={"/home"}
        className={
          "hover:bg-accent hover:text-accent-foreground ml-2 mt-1 w-min p-1"
        }
      >
        <MoveLeft className="h-5 w-5" />
      </Link>
      <nav className="flex flex-col p-4 pt-1 pr-8 border-r-4 flex-1 justify-between">
        {/* top */}
        <div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname == href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md
                ${isActive ? "bg-accent" : ""}`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
        {/* bottom */}
        <div>
          <div>
            <Link
              className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md`}
              href="/book-keeping/settings"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
          <div className="text-error-foreground">
            <button
              className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md`}
              onClick={logOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
