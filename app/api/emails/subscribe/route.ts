import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { validateEmail } from '@/app/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'website', metadata = {} } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const validation = validateEmail(email);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Invalid email' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const emailData = {
      email: email.toLowerCase().trim(),
      subscribedAt: new Date().toISOString(),
      source,
      metadata,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    };

    const docRef = await db.collection('email_subscriptions').add(emailData);

    return NextResponse.json(
      {
        success: true,
        message: 'Email subscription successful',
        id: docRef.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing email subscription:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
