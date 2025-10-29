"use client";

import Image from "next/image";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ThemeSwitcher } from "@/src/components/global/ThemeSwitcher";

export default function Home() {
  return (
    <div>
      <p className="font-semibold text-2xl mb-2">Settings</p>

      <ThemeSwitcher />

      <div className="grid grid-cols-3 gap-4 p-5"></div>
    </div>
  );
}
