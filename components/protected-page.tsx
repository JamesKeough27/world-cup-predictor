"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProtectedPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-slate-800">
          Loading...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}