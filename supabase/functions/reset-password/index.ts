import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return new Response(
                JSON.stringify({ error: "Email and password are required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Create Supabase admin client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error("Missing Supabase configuration");
            return new Response(
                JSON.stringify({ error: "Service configuration error" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Find the user using the Admin API
        const { data: usersData, error: listError } =
            await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error("Error listing users:", listError);
            return new Response(
                JSON.stringify({ error: listError.message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        const user = usersData.users.find(
            (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return new Response(
                JSON.stringify({ error: "User not found" }),
                {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Update user password using admin API with the user ID
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            {
                password: password,
            }
        );

        if (error) {
            console.error("Error updating password:", error);
            return new Response(
                JSON.stringify({ error: error.message || "Failed to update password" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: "Password updated successfully" }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response(
            JSON.stringify({ error: "An unexpected error occurred" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
