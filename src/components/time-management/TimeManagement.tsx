"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TimeManagementActions_GetUserActivities_Result {
  id: string;
  name: string;
  percentage: number;
}

export interface TimeManagementActions_GetUserActivitySessions_Result {
  id: string;
  activityId: string;
  startTimestamp: Date;
  endTimestamp: Date | null;
}

export default function TimeManagement({
  activities,
  activitySessions,
}: {
  activities: TimeManagementActions_GetUserActivities_Result[];
  activitySessions: TimeManagementActions_GetUserActivitySessions_Result[];
}) {
  const [, forceTick] = useState(0);

  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityPercentage, setNewActivityPercentage] = useState("");

  // Re-render every minute to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      forceTick((v) => v + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  function getActiveSession(activityId: string) {
    return activitySessions.find(
      (s) => s.activityId === activityId && s.endTimestamp === null
    );
  }

  function getElapsedTime(start: Date, end: Date | null) {
    const endTime = end ?? new Date();
    const diffMs = endTime.getTime() - new Date(start).getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

  function createActivity() {
    if (!newActivityName.trim()) return;

    console.log("CREATE activity", {
      name: newActivityName,
      percentage: Number(newActivityPercentage),
    });

    setNewActivityName("");
    setNewActivityPercentage("");
  }

  function startActivity(activityId: string) {
    console.log("START activity", activityId);
  }

  function stopActivity(sessionId: string) {
    console.log("STOP session", sessionId);
  }

  return (
    <div className="w-full p-6 space-y-10">
      {/* Create Activity Type */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Create Activity Type</h2>
        <div className="flex flex-wrap gap-3 max-w-full">
          <Input
            placeholder="Activity name (e.g. Learning full-stack)"
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Input
            type="number"
            placeholder="%"
            value={newActivityPercentage}
            onChange={(e) => setNewActivityPercentage(e.target.value)}
            className="w-24"
          />
          <Button onClick={createActivity}>Add</Button>
        </div>
      </section>

      {/* Activity Types + Sessions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Activities</h2>

        <div className="flex flex-col gap-4">
          {activities.length === 0 && (
            <div className="text-muted-foreground">No activity types yet</div>
          )}

          {activities.map((activity) => {
            const activeSession = getActiveSession(activity.id);

            return (
              <div
                key={activity.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-md w-full gap-2"
              >
                <div className="flex-1 break-words">
                  <div className="font-medium">{activity.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Planned: {activity.percentage}%
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                  <div className="text-sm">
                    Status: {activeSession ? "Running" : "Idle"}
                  </div>
                  <div className="text-sm">
                    Elapsed:{" "}
                    {activeSession
                      ? getElapsedTime(
                          activeSession.startTimestamp,
                          activeSession.endTimestamp
                        )
                      : "—"}
                  </div>
                  <Button
                    size="sm"
                    variant={activeSession ? "destructive" : "default"}
                    onClick={() =>
                      activeSession
                        ? stopActivity(activeSession.id)
                        : startActivity(activity.id)
                    }
                  >
                    {activeSession ? "Stop" : "Start"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
