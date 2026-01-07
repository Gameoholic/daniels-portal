"use client";

import { Ban, DoorClosed, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// todo: make all the buttons in this page have a confirmation dialog
export default function UserActionsTab({
  onUnimplemented,
}: {
  onUnimplemented: (reason: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Actions header & separator */}
      <div>
        {/* Header & separator */}
        <div className="mb-2 border-b border-muted-foreground/40">
          <span className="text-xs font-semibold text-muted-foreground">
            Actions
          </span>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <Button
            variant="outline"
            onClick={() => onUnimplemented("Delete user permanently")}
            className="w-full"
          >
            <DoorClosed className="h-4 w-4 mr-2" />
            Log user out
          </Button>

          <Button
            variant="outline"
            onClick={() => onUnimplemented("Delete user permanently")}
            className="w-full"
          >
            <Ban className="h-4 w-4 mr-2" />
            Ban user
          </Button>
        </div>
      </div>

      {/* Dangerous Actions header & separator */}
      <div>
        {/* Header & separator */}
        <div className="mb-2 border-b border-muted-foreground/40">
          <span className="text-xs font-semibold text-muted-foreground">
            Dangerous Actions
          </span>
        </div>
        <Button
          variant="destructive"
          onClick={() => onUnimplemented("Delete user permanently")}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </div>
    </div>
  );
}
