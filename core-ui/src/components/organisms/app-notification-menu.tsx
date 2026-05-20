import { useState } from "react"
import { Bell, CheckCheck, Clock, Trash2 } from "lucide-react"

import { Button } from "../ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "../ui/empty"

const initialNotifications = [
    {
        id: "leave-request",
        title: "Leave request submitted",
        description: "Rina submitted annual leave for approval.",
        time: "5m ago",
        unread: true,
    },
    {
        id: "payroll-ready",
        title: "Payroll draft is ready",
        description: "April payroll data is ready for review.",
        time: "1h ago",
        unread: true,
    },
    {
        id: "new-employee",
        title: "New employee added",
        description: "Budi Santoso has been added to Engineering.",
        time: "Yesterday",
        unread: false,
    },
]

export function AppNotificationMenu() {
    const [notifications, setNotifications] = useState(initialNotifications)
    const unreadCount = notifications.filter((item) => item.unread).length
    const hasNotifications = notifications.length > 0

    const handleMarkAllAsRead = () => {
        setNotifications((currentNotifications) =>
            currentNotifications.map((item) => ({ ...item, unread: false })),
        )
    }

    const handleDeleteAll = () => {
        setNotifications([])
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="relative"
                    />
                }
            >
                <Bell className="size-4" />
                {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                ) : null}
                <span className="sr-only">Notifications</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
                <DropdownMenuGroup>
                    <div className="flex items-center justify-between px-3 py-2">
                        <DropdownMenuLabel className="p-0 text-sm font-semibold text-foreground">
                            Notifications
                        </DropdownMenuLabel>
                        <span className="text-xs text-muted-foreground">
                            {unreadCount} unread
                        </span>
                    </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="m-0" />

                {hasNotifications ? (
                    <DropdownMenuGroup className="p-1">
                        {notifications.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                className="items-start gap-3 p-3"
                            >
                                <span className="mt-1 flex size-2 shrink-0 rounded-full bg-primary data-[read=true]:bg-muted" data-read={!item.unread} />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium leading-none">
                                        {item.title}
                                    </span>
                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                        {item.description}
                                    </span>
                                    <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {item.time}
                                    </span>
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                ) : (
                    <Empty className="border-0 px-3 py-8">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Bell className="size-5" />
                            </EmptyMedia>
                            <EmptyTitle className="text-sm">
                                No notifications
                            </EmptyTitle>
                            <EmptyDescription className="text-xs">
                                You are all caught up.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}

                {hasNotifications ? (
                    <>
                        <DropdownMenuSeparator className="m-0" />

                        <DropdownMenuGroup className="grid grid-cols-2 gap-1 p-1">
                            <DropdownMenuItem
                                className="justify-center gap-2"
                                onClick={handleMarkAllAsRead}
                            >
                                <CheckCheck className="size-4" />
                                Mark all read
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                variant="destructive"
                                className="justify-center gap-2"
                                onClick={handleDeleteAll}
                            >
                                <Trash2 className="size-4" />
                                Delete all
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
