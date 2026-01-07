"use client";

import { useState } from "react";
import { ShieldAlert, UserRoundPlus, Pencil } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AdminActions_GetUsers_Result } from "@/src/actions/per-page/admin";
import { useRouter } from "next/navigation";

/* ------------------------- */
/* Date helpers              */
/* ------------------------- */

function ConvertDateToString(date: Date) {
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return "Today";
  }

  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-IL", { dateStyle: "long" }).format(date);
}

function ConvertDayOfWeekToString(day: number) {
  return (
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][day] ?? "Unknown"
  );
}

/* ------------------------- */
/* Component                 */
/* ------------------------- */

export default function UserManagement({
  users,
  loading,
  errorString,
}: {
  users: AdminActions_GetUsers_Result[] | null;
  loading: boolean;
  errorString: string;
}) {
  const [search, setSearch] = useState("");

  if (users == null) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">todo skeleton here</p>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      <p className="font-semibold text-2xl mb-2">User Management</p>

      {/* Search bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by username, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-3 rounded-lg border border-border
                     focus:outline-none focus:ring-2 focus:ring-accent
                     focus:border-accent transition-colors"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length ? (
          filteredUsers.map((user) => {
            const router = useRouter();
            return (
              <Card
                onClick={() => router.push(`/admin/user-management/${user.id}`)}
                key={user.id}
                className="cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{user.username}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  {/* Icons + tooltips
                  <div className="flex gap-2">
                    {user.hasPrivilegedAdminPermissions && (
                      <Tooltip>
                        <TooltipTrigger>
                          <ShieldAlert className="h-5 w-5 text-destructive cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          This user has privileged admin permissions.
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {user.canIssueAccountCreationCodes && (
                      <Tooltip>
                        <TooltipTrigger>
                          <UserRoundPlus className="h-5 w-5 text-destructive cursor-pointer" />
                        </TooltipTrigger>
                        <TooltipContent>
                          This user can enter the admin panel and issue account
                          creation codes.
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div> */}
                </CardHeader>

                <CardContent className="space-y-1">
                  {/* Created date with tooltip */}
                  <Tooltip>
                    <TooltipTrigger className="text-sm text-muted-foreground cursor-pointer">
                      Created:{" "}
                      {ConvertDateToString(new Date(user.creationTimestamp))}
                    </TooltipTrigger>
                    <TooltipContent>
                      {ConvertDayOfWeekToString(
                        new Date(user.creationTimestamp).getDay()
                      )}
                      {" • "}
                      {new Date(user.creationTimestamp).toLocaleString("en-il")}
                    </TooltipContent>
                  </Tooltip>

                  <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                </CardContent>

                <CardFooter className="flex justify-end" />
              </Card>
            );
          })
        ) : (
          <p className="text-muted-foreground col-span-full">No users found.</p>
        )}
      </div>
    </div>
  );
}
