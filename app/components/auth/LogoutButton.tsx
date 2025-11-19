"use client";

import { useRouter } from "next/navigation";
import { clearTokens } from "@/app/lib/auth";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.push("/signin");
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      }
    >
      Logout
    </button>
  );
}
