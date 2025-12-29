import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface EmailSubscription {
  email: string;
  subscribedAt: Timestamp;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface EmailSubmissionResult {
  success: boolean;
  message: string;
  id?: string;
}

export async function saveEmailToFirestore(
  email: string,
  source?: string,
  metadata?: Record<string, unknown>
): Promise<EmailSubmissionResult> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const emailData: EmailSubscription = {
      email: email.toLowerCase().trim(),
      subscribedAt: serverTimestamp() as Timestamp,
      source,
      metadata,
    };

    const docRef = await addDoc(collection(db, 'email_subscriptions'), emailData);

    return {
      success: true,
      message: 'Email saved successfully',
      id: docRef.id,
    };
  } catch (error) {
    console.error('Error saving email to Firestore:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save email',
    };
  }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  return { valid: true };
}
