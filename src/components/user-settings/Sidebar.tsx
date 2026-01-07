"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  RectangleEllipsis,
  User,
  Settings,
  MoveLeft,
  DollarSign,
  UserStar,
  LogOut,
  CheckCircle2Icon,
  AlertCircle,
  AlertCircleIcon,
  UserRoundCog,
  Shield,
  Rainbow,
  BookHeart,
  Cable,
} from "lucide-react"; // https://lucide.dev/icons/
import LogOutButton from "../global/LogOutButton";

const navItems = [
  { href: "/user-settings", label: "Security", icon: Shield },
  {
    href: "/user-settings/advanced-settings",
    label: "Advanced Settings",
    icon: Cable,
  },
  {
    href: "/user-settings/preferences",
    label: "Preferences",
    icon: BookHeart,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {/* App title */}
      <div className="flex items-center ml-2 mt-1">
        <UserRoundCog className="h-5 w-5" />
        <p className="ml-2">User Settings</p>
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
              href="/admin/settings"
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
