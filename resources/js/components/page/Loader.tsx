import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
    className?: string;
}

export default function PageLoader({ className }: PageLoaderProps) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-background",
                className
            )}
        >
            <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white" />
        </div>
    );
}
