"use client";

import React from "react";

interface AppBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * AppBackground provides a consistent animated background across all pages.
 * Features a gradient background with animated floating orbs for a modern look.
 */
export default function AppBackground({ children, className = "" }: AppBackgroundProps) {
    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-tyrian-50 to-zinc-50 relative overflow-hidden ${className}`}>
            {/* Animated background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-tyrian-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-zinc-400/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "1s" }}
                ></div>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-tyrian-400/5 rounded-full blur-3xl animate-pulse"
                    style={{ animationDelay: "2s" }}
                ></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
