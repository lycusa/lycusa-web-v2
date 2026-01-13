"use client";

import React from "react";

interface AppBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * AppBackground provides a consistent animated background across all pages.
 * Features Apple's "Liquid Glass" design language with dynamic translucency,
 * gradient mesh backgrounds, and real-time animated depth effects.
 */
export default function AppBackground({ children, className = "" }: AppBackgroundProps) {
    return (
        <div className={`min-h-screen relative overflow-hidden ${className}`}>
            {/* Base Gradient Mesh Background */}
            <div className="fixed inset-0 gradient-mesh z-0" />

            {/* Zen Minimalist Orbs - Subtle & Warm */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Primary Tyrian Orb - Top Right - Very Subtle */}
                <div
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-slow"
                    style={{
                        background: 'radial-gradient(circle, rgba(99, 0, 43, 0.05) 0%, rgba(99, 0, 43, 0.02) 40%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Secondary Orb - Bottom Left - Warm & Gentle */}
                <div
                    className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full animate-float-slow"
                    style={{
                        background: 'radial-gradient(circle, rgba(250, 240, 235, 0.4) 0%, rgba(99, 0, 43, 0.03) 40%, transparent 70%)',
                        filter: 'blur(100px)',
                        animationDelay: '2s',
                    }}
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
