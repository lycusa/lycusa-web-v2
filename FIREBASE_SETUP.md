# Firebase Email Collection Setup Guide

This guide will help you set up Firebase Firestore to collect email subscriptions.

## Overview

The email collection system uses:
- **Frontend**: EmailCollector React component with validation
- **Backend**: Next.js API route with Firebase Admin SDK
- **Storage**: Firebase Firestore database

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard to create your project
4. Enable Google Analytics (optional)

## Step 2: Set Up Firestore Database

1. In your Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose production mode or test mode:
   - **Test mode**: Good for development (data is public for 30 days)
   - **Production mode**: Secure, requires authentication rules
4. Select a location for your database (choose closest to your users)
5. Click **Enable**

### Recommended Security Rules (for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow server-side writes only
    match /email_subscriptions/{document} {
      allow read: if false;  // No client-side reads
      allow write: if false; // No client-side writes (server-only via Admin SDK)
    }
  }
}
```

## Step 3: Get Firebase Configuration (Client-Side)

1. In Firebase Console, click the **gear icon** ⚙️ > **Project settings**
2. Scroll to "Your apps" section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Lycusa Web")
5. Copy the Firebase configuration object

You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

## Step 4: Get Firebase Admin SDK Credentials (Server-Side)

1. In Firebase Console, go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Click **Generate Key** - this downloads a JSON file
4. **IMPORTANT**: Keep this file secure! Never commit it to version control

The JSON file contains:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## Step 5: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your Firebase credentials:

```bash
# Firebase Client Configuration (from Step 3)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

# Firebase Admin SDK Configuration (from Step 4)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- The `\n` characters represent newlines - keep them as-is
- Never commit `.env.local` to version control (it's in `.gitignore`)

## Step 6: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/newsletter` in your browser

3. Enter an email address and click Subscribe

4. Check Firebase Console > Firestore Database > `email_subscriptions` collection

You should see a new document with:
- `email`: the email address you entered
- `subscribedAt`: timestamp
- `source`: "newsletter_page"
- `userAgent`: browser info
- `ip`: requester IP

## Using the Email Collection Components

### Homepage Modal (Already Implemented)

The email subscription modal is already integrated into the homepage (`app/page.tsx`) and will:
- Show automatically 3 seconds after the page loads (for first-time visitors)
- Only appear once per user (tracked via localStorage)
- Not show again if user subscribes or dismisses it
- Have a beautiful, responsive design matching your app's aesthetic

To customize the delay:
```tsx
<EmailSubscriptionModal delayMs={5000} /> // 5 seconds
```

To reset and see the modal again during development:
```javascript
// In browser console
localStorage.removeItem('lycusa_email_modal_seen');
localStorage.removeItem('lycusa_email_subscribed');
```

### EmailCollector Component - Basic Usage

```tsx
import EmailCollector from '@/app/components/shared/EmailCollector';

export default function MyPage() {
  return (
    <EmailCollector />
  );
}
```

### Advanced Usage with Options

```tsx
<EmailCollector
  source="homepage_footer"
  placeholder="Enter your email"
  buttonText="Join Newsletter"
  successMessage="Thanks for joining!"
  className="my-custom-class"
  onSuccess={(email) => {
    // Track successful subscription
    console.log('User subscribed:', email);
  }}
  onError={(error) => {
    // Handle errors
    console.error('Subscription failed:', error);
  }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | string | `"website"` | Source identifier for tracking |
| `placeholder` | string | `"Enter your email"` | Input placeholder text |
| `buttonText` | string | `"Subscribe"` | Submit button text |
| `successMessage` | string | `"Thanks for subscribing!"` | Success message |
| `className` | string | `""` | Additional CSS classes |
| `onSuccess` | function | - | Callback after successful submission |
| `onError` | function | - | Callback on error |

## Viewing Collected Emails

### In Firebase Console

1. Go to **Firestore Database**
2. Click on `email_subscriptions` collection
3. View all documents with subscriber information

### Export to CSV (Optional)

You can export data from Firebase Console:
1. Select the collection
2. Use the export feature or Firebase CLI

### Using Firebase CLI (Advanced)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# List collections
firebase firestore:get email_subscriptions --project your-project-id
```

## Security Best Practices

1. **Never expose Admin SDK credentials** in client-side code
2. **Use environment variables** for all sensitive data
3. **Set proper Firestore security rules** to prevent unauthorized access
4. **Regularly review** who has access to your Firebase project
5. **Enable Firebase App Check** for additional security (optional)

## Troubleshooting

### "Database not configured" Error

- Check that all environment variables are set correctly
- Restart your dev server after changing `.env.local`
- Verify the private key format (should include `\n` for newlines)

### "Permission denied" Error

- Check Firestore security rules
- Ensure Admin SDK credentials are correct
- Verify the service account has proper permissions

### Emails Not Appearing in Firestore

- Check browser console for errors
- Verify API route is working: `/api/emails/subscribe`
- Check Firebase Console for any quota limits
- Ensure Firestore database is enabled

## Next Steps

- Set up email notifications when someone subscribes (using Firebase Functions)
- Integrate with email marketing platforms (SendGrid, Mailchimp, etc.)
- Add double opt-in confirmation
- Create an admin dashboard to manage subscribers

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- Check the Firebase Console for error logs
