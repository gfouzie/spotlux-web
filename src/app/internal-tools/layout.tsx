"use client";

import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InternalToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: userLoading, isSuperuser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !isSuperuser) {
      router.push("/");
    }
  }, [userLoading, isSuperuser, router]);

  // Show loading state while checking permissions
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-text-col">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not a superuser
  if (!isSuperuser) {
    return null;
  }

  // Render children if user is a superuser
  return <>{children}</>;
}



