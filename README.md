# mathusigan - Next.js Contact Form with Gmail SMTP

A secure Next.js application with a contact form that sends emails via Gmail SMTP.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gmail SMTP

#### Get App Password from Gmail:
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Navigate to **Security** (left sidebar)
3. Enable **2-Step Verification** if not already enabled
4. Scroll to **App passwords** (appears after 2FA is enabled)
5. Select **Mail** and **Windows Computer** (or your device)
6. Generate the 16-character app password
7. Copy it (without spaces)

#### Update `.env.local`:
```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RECEIVER_EMAIL=
```

⚠️ **IMPORTANT:** Never commit `.env.local` to GitHub!

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Test Contact Form
- Go to http://localhost:3000/contact
- Fill out the form
- Submit to send an email

## Project Structure

```
next-app/
├── pages/
│   ├── api/
│   │   └── contact.ts       # Email API endpoint
│   ├── contact.tsx          # Contact form page
│   └── index.tsx            # Home page
├── .env.local               # Environment variables (not committed)
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── next.config.js           # Next.js config
```

## Deployment to GitHub & Vercel

### Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/mathusigan.git
git push -u origin main
```

### Deploy to Vercel:
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **New Project** and select your repository
4. In **Environment Variables**, add:
   - `SMTP_HOST=`
   - `SMTP_PORT=`
   - `SMTP_USER=`
   - `SMTP_PASS=`
   - `RECEIVER_EMAIL=`
5. Deploy!

## Security Notes

✅ **Why this setup is secure:**
- Credentials are stored in `.env.local` (not in code)
- `.env.local` is in `.gitignore` (never pushed to GitHub)
- Email sending happens on the backend (not exposed to frontend)
- User passwords are never collected or transmitted

## API Endpoint

**POST** `/api/contact`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Test",
  "message": "Hello!"
}
```

Response:
```json
{
  "success": true,
  "message": "Email sent successfully!"
}
```

## Troubleshooting

- **"Less secure app" error**: Use App Password instead of Gmail password
- **Port 465 connection error**: Make sure SMTP_PORT=465 and secure=true
- **Email not sending**: Check credentials in `.env.local`
- **Form not submitting**: Open browser console (F12) to see error messages

## License

MIT
