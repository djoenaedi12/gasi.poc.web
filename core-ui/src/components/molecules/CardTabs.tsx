import { cn } from "../../lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import type { ComponentProps } from "react";

function CardTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
    return (
        <TabsList
            variant="line"
            className={cn(
                "mb-1 inline-flex !h-auto w-fit max-w-full flex-wrap justify-start gap-1 overflow-visible !rounded-lg border bg-background p-1.5 text-muted-foreground shadow-sm",
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
                "h-7 flex-none justify-center rounded-md border-0 px-2.5 py-1 text-center text-xs font-medium leading-tight whitespace-nowrap",
                "after:hidden transition-all hover:bg-muted/60 hover:text-foreground",
                "data-active:!bg-primary/10 data-active:!text-primary data-active:shadow-sm",
                "[&_svg]:size-3.5 [&_svg]:text-current",
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
