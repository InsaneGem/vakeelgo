# OTP Password Reset Setup Guide

## Overview
The forgot password feature now uses actual 6-digit OTP codes sent via email, replacing Supabase's magic link authentication.

## Setup Steps

### 1. Database Migration
Run the migration to create the OTP storage table:
```bash
supabase db push
```

This creates:
- `password_reset_otp` table to store OTP codes
- Proper indexes for performance
- RLS policies for security

### 2. Email Service Configuration
The OTP emails are sent using **Resend**. You need to:

#### Option A: Using Resend (Recommended)
1. Get a Resend API key from [resend.com](https://resend.com)
2. Add it to your Supabase project secrets:
   ```bash
   supabase secrets set RESEND_API_KEY "your_api_key_here"
   ```

#### Option B: Using Supabase Email (Built-in)
If you prefer Supabase's email service, modify `supabase/functions/send-otp-email/index.ts` to use:
```typescript
// Use Supabase built-in email instead of Resend
```

### 3. Deploy Edge Function
Deploy the OTP email sending function:
```bash
supabase functions deploy send-otp-email
```

### 4. Environment Variables
Make sure these are set in your `.env.local`:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## How It Works

### Flow:
1. **User enters email** → System checks if email exists in database
2. **OTP Generated** → Random 6-digit code created with 10-minute expiry
3. **Email Sent** → OTP sent via Resend email service
4. **User enters OTP** → Code validated against stored OTP
5. **New Password** → User sets new password with validation
6. **Password Updated** → Backend updates password in Supabase Auth

### OTP Features:
- ✅ 6-digit numeric code
- ✅ 10-minute expiration
- ✅ Email delivery with beautiful HTML template
- ✅ Validation and expiry checking
- ✅ Stored in database for audit trail
- ✅ State-based fallback if database fails

### Security:
- OTP expires after 10 minutes
- OTP verified before password change
- Passwords require: 8 chars, capital, small, digit, special char
- Password change updates Supabase Auth backend

## Testing

### Local Testing:
```bash
# Start Supabase local
supabase start

# Deploy function locally
supabase functions deploy send-otp-email

# Test via UI
```

### Debug OTP:
If testing and OTP emails aren't received:
1. Check Supabase Edge Function logs
2. Verify RESEND_API_KEY is set
3. Check email spam folder
4. Try with valid email address

## Troubleshooting

### "Email service not configured"
- Make sure `RESEND_API_KEY` is set in Supabase secrets
- Run: `supabase secrets list` to verify

### OTP not received
- Check Resend dashboard for failed sends
- Verify email address is correct
- Check spam/junk folder
- Check Edge Function logs in Supabase

### OTP expired
- OTP expires after 10 minutes
- User needs to request new OTP by clicking "Send OTP" again

## Database Schema

```sql
Table: password_reset_otp
- id (UUID) - Primary key
- email (TEXT) - User email
- otp (TEXT) - 6-digit code
- expires_at (TIMESTAMP) - Expiration time
- used (BOOLEAN) - Whether OTP was used
- created_at (TIMESTAMP) - Creation time
- updated_at (TIMESTAMP) - Last update time
```

## API Endpoints

### Send OTP Email
```
POST /functions/v1/send-otp-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP email sent successfully",
  "messageId": "..."
}
```

## Future Enhancements

- [ ] SMS OTP option
- [ ] Rate limiting on OTP requests
- [ ] Multiple OTP attempts tracking
- [ ] Email templates in UI
- [ ] Resend OTP button with cooldown
