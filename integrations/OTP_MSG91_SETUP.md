# Real OTP (MSG91) + retailproai.in

## Render backend env

```
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_dlt_otp_template_id
OTP_MOCK=false
JWT_SECRET=...
TRIAL_DAYS=7
```

`OTP_MOCK=true` sirf local test — production par **false**.

## MSG91 setup

1. [msg91.com](https://msg91.com) account
2. **OTP** section → API auth key
3. India: **DLT** entity + OTP template approve
4. Template example: `Your RetailPro OTP is ##OTP##. Valid 5 minutes.`

## Vercel frontend env

```
REACT_APP_API_URL=https://retailpro-backend-n70s.onrender.com
REACT_APP_DEMO_YOUTUBE_ID=YOUR_YOUTUBE_VIDEO_ID
REACT_APP_SUPPORT_WHATSAPP=91XXXXXXXXXX
REACT_APP_ENTERPRISE_EMAIL=support@retailproai.in
```

## Customer flow

1. `https://www.retailproai.in/onboarding/1` — mobile OTP + register
2. `/onboarding/2` — YouTube demo
3. `/onboarding/3` — WhatsApp, ₹599/₹999, enterprise email
4. `/app` — POS

## Live Razorpay

Render par `rzp_live_...` keys + live plan IDs (see RAZORPAY_LIVE.md).
