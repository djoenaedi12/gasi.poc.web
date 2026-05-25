import { cn } from "../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { ComponentProps } from "react";

function CardTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
    return (
        <TabsList
            variant="line"
            className={cn(
                "h-auto w-fit justify-start overflow-x-auto border-b border-border bg-transparent p-0 text-muted-foreground",
                className,
            )}
            {...props}
        />
    );
}

function CardTabsTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
    return (
        <TabsTrigger
            className={cn(
                "flex-none rounded-none border-0 px-0 py-2.5 text-sm font-medium",
                "data-active:bg-transparent data-active:font-semibold data-active:text-primary data-active:shadow-none",
                "after:bg-primary",
                "[&_svg]:size-4",
                className,
            )}
            {...props}
        />
    );
}

function CardTabsContent({ className, ...props }: ComponentProps<typeof TabsContent>) {
    return (
        <TabsContent
            className={cn("mt-4", className)}
            {...props}
        />
    );
}

export { Tabs as CardTabs, CardTabsList, CardTabsTrigger, CardTabsContent };
