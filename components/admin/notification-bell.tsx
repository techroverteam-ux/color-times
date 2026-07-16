"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationRow {
  _id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationRow[];
  unreadCount: number;
}

function timeAgo(value: string): string {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch("/api/admin/notifications?limit=10");
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.data;
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/admin/notifications/mark-all-read", { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function handleSelect(notification: NotificationRow) {
    if (!notification.isRead) markRead.mutate(notification._id);
    if (notification.link) router.push(notification.link);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" />
        }
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-medium">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="text-xs font-medium text-accent hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                onClick={() => handleSelect(notification)}
                className="flex-col items-start gap-0.5 whitespace-normal"
              >
                <div className="flex w-full items-center gap-2">
                  {!notification.isRead && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  )}
                  <p className={cn("text-sm", notification.isRead ? "font-normal" : "font-medium")}>
                    {notification.title}
                  </p>
                </div>
                <p className="line-clamp-2 pl-3.5 text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <p className="pl-3.5 text-[10px] text-muted-foreground/70">
                  {timeAgo(notification.createdAt)}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
