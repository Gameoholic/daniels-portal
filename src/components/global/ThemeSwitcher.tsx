"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MoonStar,
  Sun,
  Paintbrush,
  Moon,
  ChevronUp,
  ChevronDown,
} from "lucide-react"; // https://lucide.dev/icons/
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; //www.radix-ui.com/primitives/docs/components/dropdown-menu
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const themes = ["experimental", "ocean", "forest", "purple"]; // themes excluding dark and light

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Useeffect only run on the client after hydration, meaning theme will be available (it isn't initially),
  // and will change mounted therefore everything will be re-rendered, this time we will not return early.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return;
  }

  return (
    <div className="flex items-center">
      <Moon className="mr-1 h-5 w-5 " />
      <span className="mr-2">Dark mode</span>
      <Switch
        checked={theme == "dark"}
        onCheckedChange={(isChecked) => setTheme(isChecked ? "dark" : "light")}
        className={
          theme != "dark" && theme != "light"
            ? "bg-gradient-to-r from-red-500 via-green-400 to-yellow-400"
            : ""
        }
      />
      <div className="ml-5">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center">
              <ChevronDown className="mr-1 h-5 w-5 " />
              <span>More Themes</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {themes.map((theme) => (
              <DropdownMenuItem key={theme} onClick={() => setTheme(theme)}>
                {/* Turn "themename" to "Themename" */}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}{" "}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
