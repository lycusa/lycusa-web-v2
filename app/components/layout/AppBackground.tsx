"use client";

import React from "react";

interface AppBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * AppBackground provides a stunning animated aurora gradient background.
 * Features multiple animated color blobs for a modern 2025 design aesthetic.
 */
export default function AppBackground({ children, className = "" }: AppBackgroundProps) {
    return (
        <div className={`min-h-screen relative overflow-hidden ${className}`}>
            {/* Aurora Gradient Base Layer */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-tyrian-50/30 to-rose-50/40" />
            
            {/* Animated Aurora Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Primary Tyrian Blob - Top Right */}
                <div 
                    className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-tyrian-400/30 to-tyrian-600/20 aurora-blob"
                    style={{ animationDuration: '18s' }}
                />
                
                {/* Rose Accent Blob - Bottom Left */}
                <div 
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-rose-300/25 to-pink-400/20 aurora-blob"
                    style={{ animationDuration: '22s', animationDelay: '-5s' }}
                />
                
                {/* Purple Accent Blob - Center */}
                <div 
                    className="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-purple-400/15 to-tyrian-300/20 aurora-blob"
                    style={{ animationDuration: '25s', animationDelay: '-10s' }}
                />
                
                {/* Pink Accent Blob - Top Left */}
                <div 
                    className="absolute -top-20 left-1/3 w-[350px] h-[350px] bg-gradient-to-br from-pink-300/20 to-rose-400/15 aurora-blob"
                    style={{ animationDuration: '20s', animationDelay: '-3s' }}
                />
                
                {/* Tyrian Secondary Blob - Bottom Right */}
                <div 
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-tyrian-500/15 to-purple-400/10 aurora-blob"
                    style={{ animationDuration: '23s', animationDelay: '-8s' }}
                />
            </div>
            
            {/* Subtle Mesh Gradient Overlay */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-30"
                style={{
                    backgroundImage: `
                        radial-gradient(at 40% 20%, rgba(99, 0, 43, 0.08) 0px, transparent 50%),
                        radial-gradient(at 80% 0%, rgba(219, 112, 147, 0.06) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, rgba(139, 69, 119, 0.05) 0px, transparent 50%),
                        radial-gradient(at 80% 50%, rgba(255, 182, 193, 0.06) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(99, 0, 43, 0.05) 0px, transparent 50%),
                        radial-gradient(at 80% 100%, rgba(199, 21, 133, 0.05) 0px, transparent 50%)
                    `
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
