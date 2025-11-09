"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Settings,
  UserRoundCog,
  LogOut,
  UserStar,
  Dumbbell,
  Car,
  Languages,
  RefreshCcw,
  Album,
  CheckCircle2Icon,
  AlertCircleIcon,
  Pencil,
  GitFork,
} from "lucide-react"; // https://lucide.dev/icons/
import { logUserOut } from "@/src/actions/auth";
import { toast } from "sonner";
import LogOutButton from "../global/LogOutButton";

const navItems = [
  {
    href: "/book-keeping",
    label: "Book Keeping",
    icon: Album,
  },
  {
    href: "/gym",
    label: "Gym",
    icon: Dumbbell,
  },
  {
    href: "/car",
    label: "Car",
    icon: Car,
  },
  {
    href: "/wanikani",
    label: "Wanikani",
    icon: Languages,
  },
  {
    href: "/obsidian",
    label: "Obsidian",
    icon: Pencil,
  },
  {
    href: "/git",
    label: "Git",
    icon: GitFork,
  },
  { href: "/admin", label: "Admin Panel", icon: UserStar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {/* App title */}
      <div className="flex items-center ml-2 mt-1">
        <Home className="h-5 w-5" />
        <p className="ml-2">Home</p>
      </div>
      {/* Return home replacement div */}
      <div className="m-6 mt-2"></div>
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
          <div className="text-muted-foreground">
            <Link
              className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md`}
              href="/home/user-settings"
            >
              <UserRoundCog className="h-5 w-5" />
              <span>User Settings</span>
            </Link>
          </div>
          <div>
            <Link
              className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md`}
              href="/home/settings"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
          <LogOutButton />
        </div>
      </nav>
    </div>
  );
}
