"use client";

import { SWRConfig } from "swr";
import { swrConfig } from "@/app/lib/swrConfig";

interface SWRProviderProps {
    children: React.ReactNode;
}

/**
 * SWR Provider component that wraps the application with global SWR configuration.
 * Provides caching, revalidation, and error handling for all SWR hooks.
 */
export default function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig value={swrConfig}>
            {children}
        </SWRConfig>
    );
}
