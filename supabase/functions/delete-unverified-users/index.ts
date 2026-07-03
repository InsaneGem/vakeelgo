import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const TEN_MINUTES = 10 * 60 * 1000;
  const now = Date.now();

  // Get users from Auth
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  for (const user of data.users) {
    // Skip verified users
    if (user.email_confirmed_at) continue;

    const createdAt = new Date(user.created_at).getTime();

    // Skip users created less than 10 minutes ago
    if (now - createdAt < TEN_MINUTES) continue;

    console.log(`Deleting unverified user: ${user.email}`);

    // Delete profile (ignore error if no row exists)
    await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    // Delete auth user
    await supabase.auth.admin.deleteUser(user.id);
  }

  return new Response("Cleanup completed");
});