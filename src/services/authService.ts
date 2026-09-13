import { User } from '../types';

/**
 * Mocked authentication.
 *
 * Every function here has the signature a real endpoint would have — async, capable of
 * rejecting with a user-facing message, and returning a `{ user, token }` session.
 * Phase 2 replaces the bodies with `fetch` calls; no caller changes.
 *
 *   requestOtp()  ->  POST /auth/otp/request
 *   verifyOtp()   ->  POST /auth/otp/verify
 *   signup()      ->  POST /auth/signup
 */

export interface AuthSession {
  user: User;
  token: string;
}

export class AuthError extends Error {}

/** Simulates network latency so loading states are actually exercised in development. */
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function makeToken(): string {
  return `mock_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function nameFromPhone(phone: string): string {
  return `Zipp User ${phone.slice(-4)}`;
}

/**
 * Phase 1 skips the OTP screen entirely, but the step exists so the flow can be
 * inserted between "Continue" and "signed in" without reshaping the context.
 */
export async function requestOtp(phone: string): Promise<{ otpToken: string }> {
  await delay(700);
  if (!/^\d{10}$/.test(phone)) {
    throw new AuthError('Enter a valid 10-digit mobile number.');
  }
  return { otpToken: makeToken() };
}

export async function verifyOtp(phone: string, _otp: string): Promise<AuthSession> {
  await delay(600);
  return {
    user: {
      id: `u_${phone}`,
      name: nameFromPhone(phone),
      phone,
      createdAt: new Date().toISOString(),
    },
    token: makeToken(),
  };
}

/** Phase 1 login: validate, pause, and hand back a session. */
export async function login(phone: string): Promise<AuthSession> {
  await delay(900);

  if (!/^\d{10}$/.test(phone)) {
    throw new AuthError('Enter a valid 10-digit mobile number.');
  }
  if (phone.startsWith('0')) {
    throw new AuthError('Mobile numbers cannot start with 0.');
  }

  return {
    user: {
      id: `u_${phone}`,
      name: nameFromPhone(phone),
      phone,
      createdAt: new Date().toISOString(),
    },
    token: makeToken(),
  };
}

export async function signup(input: {
  name: string;
  phone: string;
  email?: string;
}): Promise<AuthSession> {
  await delay(1100);

  if (!input.name.trim()) {
    throw new AuthError('Please tell us your name.');
  }
  if (!/^\d{10}$/.test(input.phone)) {
    throw new AuthError('Enter a valid 10-digit mobile number.');
  }

  return {
    user: {
      id: `u_${input.phone}`,
      name: input.name.trim(),
      phone: input.phone,
      email: input.email?.trim() || undefined,
      createdAt: new Date().toISOString(),
    },
    token: makeToken(),
  };
}
