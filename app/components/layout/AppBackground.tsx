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

            {/* Dynamic Liquid Glass Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Primary Tyrian Orb - Top Right */}
                <div
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full animate-float-slow"
                    style={{
                        background: 'radial-gradient(circle, rgba(99, 0, 43, 0.12) 0%, rgba(99, 0, 43, 0.06) 40%, transparent 70%)',
                        filter: 'blur(60px)',
                    }}
                />

                {/* Secondary Orb - Bottom Left */}
                <div
                    className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full animate-float"
                    style={{
                        background: 'radial-gradient(circle, rgba(214, 146, 174, 0.15) 0%, rgba(99, 0, 43, 0.08) 40%, transparent 70%)',
                        filter: 'blur(80px)',
                        animationDelay: '1s',
                    }}
                />

                {/* Central Floating Orb */}
                <div
                    className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full animate-float-delayed"
                    style={{
                        background: 'radial-gradient(circle, rgba(245, 231, 237, 0.3) 0%, rgba(99, 0, 43, 0.05) 50%, transparent 70%)',
                        filter: 'blur(50px)',
                    }}
                />

                {/* Accent Orb - Right Side */}
                <div
                    className="absolute top-2/3 right-1/4 w-[350px] h-[350px] rounded-full animate-float-slow"
                    style={{
                        background: 'radial-gradient(circle, rgba(176, 24, 63, 0.08) 0%, rgba(99, 0, 43, 0.04) 50%, transparent 70%)',
                        filter: 'blur(45px)',
                        animationDelay: '3s',
                    }}
                />

                {/* Light Reflection Effect - Top */}
                <div
                    className="absolute top-0 left-1/3 w-[800px] h-[300px] opacity-40"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
                        filter: 'blur(40px)',
                    }}
                />

                {/* Subtle Grid Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99, 0, 43, 0.8) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Glass Noise Texture Overlay */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
