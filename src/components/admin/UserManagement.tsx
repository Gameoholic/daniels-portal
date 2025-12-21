"use client";

import { ClientUser } from "@/src/utils/client_types";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserManagement({
  users,
  loading,
  errorString,
}: {
  users: ClientUser[] | null;
  loading: boolean;
  errorString: string;
}) {
  if (users == null) {
    return (
      <div>
        <p>todo skeleton here</p>
      </div>
    );
  }

  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
  );

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
          className="w-full md:w-1/2 p-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredUsers.length ? (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <CardHeader>
                <CardTitle className="text-lg">{user.username}</CardTitle>
                <CardDescription>Email: {user.email}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Created:{" "}
                  {new Date(user.creationTimestamp).toLocaleString("en-il")}
                </p>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
              </CardContent>

              <CardFooter className="flex justify-end"></CardFooter>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground col-span-full">No users found.</p>
        )}
      </div>
    </div>
  );
}
