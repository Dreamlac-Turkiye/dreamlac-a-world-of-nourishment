import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { isDemoMode } from "@/config/env";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (isDemoMode) throw redirect({ to: "/yonetim-onizleme" });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/giris" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});
