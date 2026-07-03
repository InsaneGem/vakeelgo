import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return new Response(
                JSON.stringify({ error: "Email and OTP are required" }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Get Resend API key from environment
        const resendApiKey = Deno.env.get("RESEND");
        if (!resendApiKey) {
            console.error("RESEND API key not configured");
            return new Response(
                JSON.stringify({ error: "Email service not configured" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // Send email using Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "noreply@vakeelgo.com",
                to: email,
                subject: "Password Reset OTP - VakeelGo",
                html: `
          <!DOCTYPE html>
     <html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
        'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }

    .card {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      color: #111827;
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 600;
    }

    .content {
      text-align: center;
    }

    .content p {
      color: #6b7280;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .otp-box {
      background-color: #f3f4f6;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }

    .otp-code {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      letter-spacing: 4px;
    }

    .timer {
      color: #ef4444;
      font-size: 14px;
      margin-top: 8px;
    }

    .footer {
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="card">

      <div class="header">
        <h1>Reset Your Password</h1>
      </div>

      <div class="content">
        <p>
          We received a request to reset your VakeelGo password.
          Use the code below to proceed:
        </p>

        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="timer">⏱️ Valid for 10 minutes</div>
        </div>

        <p style="color: #4b5563; margin-top: 20px;">
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>

      <div class="footer">
        <p>© 2026 VakeelGo. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>
        `,
            }),
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error("Resend API error:", errorData);
            throw new Error(`Failed to send email: ${emailResponse.statusText}`);
        }

        const result = await emailResponse.json();

        return new Response(
            JSON.stringify({
                success: true,
                message: "OTP email sent successfully",
                messageId: result.id,
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error in send-otp-email:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : "Internal server error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
