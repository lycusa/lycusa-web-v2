"use client";

import { useState, useEffect } from "react";
import { AppBackground, Header } from "@/app/components/layout";
import { getBlockedUsers, unblockUser } from "@/app/lib/api";
import type { RelatedUser } from "@/app/lib/types/user";
import Link from "next/link";
import Image from "next/image";

export default function BlockedUsersPage() {
  const [blockedUsers, setBlockedUsers] = useState<RelatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoading(true);
        const { blockedUsers } = await getBlockedUsers();
        setBlockedUsers(blockedUsers || []);
      } catch (error) {
        console.error("Failed to fetch blocked users:", error);
        // You might want to show a toast notification here
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblock = async (userId: string) => {
    try {
      setUnblocking(userId);
      await unblockUser(userId);
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Failed to unblock user:", error);
      // You might want to show a toast notification here
    } finally {
      setUnblocking(null);
    }
  };

  return (
    <AppBackground>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Settings
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Blocked Users
          </h1>
          <p className="text-gray-600">
            Users you have blocked will not be able to interact with you.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : blockedUsers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You haven't blocked any users.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {blockedUsers.map((user) => (
                <li
                  key={user.id}
                  className="p-4 sm:p-6 flex items-center justify-between"
                >
                  <Link
                    href={`/users/${user.id}`}
                    className="flex items-center gap-4 group"
                  >
                    <Image
                      src={user.profile?.avatarUrl || "/default-avatar.png"}
                      alt={user.profile?.username || "user"}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-tyrian-700 transition-colors">
                        {user.profile?.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        @{user.profile?.username}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleUnblock(user.id)}
                    disabled={unblocking === user.id}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                  >
                    {unblocking === user.id ? "Unblocking..." : "Unblock"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AppBackground>
  );
}
