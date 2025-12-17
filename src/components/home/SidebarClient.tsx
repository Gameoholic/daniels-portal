// SidebarClient.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  UserRoundCog,
  UserStar,
  Dumbbell,
  Car,
  Languages,
  Album,
  Pencil,
  GitFork,
} from "lucide-react";
import LogOutButton from "../global/LogOutButton";

export type SidebarItem = {
  href: string;
  label: string;
  iconName: string;
};

const ICONS = [
  { name: "Album", component: Album },
  { name: "UserStar", component: UserStar },
  { name: "Dumbbell", component: Dumbbell },
  { name: "Car", component: Car },
  { name: "Languages", component: Languages },
  { name: "Album", component: Album },
  { name: "Pencil", component: Pencil },
  { name: "GitFork", component: GitFork },
];

export function SidebarClient({ navItems }: { navItems: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      <div className="flex items-center ml-2 mt-1">
        <Home className="h-5 w-5" />
        <p className="ml-2">Home</p>
      </div>

      <div className="m-6 mt-2"></div>

      <nav className="flex flex-col p-4 pt-1 pr-8 border-r-4 flex-1 justify-between">
        {/* Top nav items */}
        <div>
          {navItems.map(({ href, label, iconName }) => {
            const isActive = pathname === href;

            const IconItem = ICONS.find((i) => i.name === iconName);
            if (!IconItem) {
              throw new Error(`Icon ${iconName} not found.`);
            }
            const Icon = IconItem.component;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md ${
                  isActive ? "bg-accent" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom nav */}
        <div>
          <div className="text-muted-foreground">
            <Link
              className="flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md"
              href="/home/user-settings"
            >
              <UserRoundCog className="h-5 w-5" />
              <span>User Settings</span>
            </Link>
          </div>

          <div>
            <Link
              className="flex items-center gap-2 p-3 hover:bg-accent hover:text-accent-foreground rounded-md"
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
