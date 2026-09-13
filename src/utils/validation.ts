/**
 * Field-level validators. Each returns a user-facing message, or `undefined` when valid,
 * which is exactly the shape the `Input` component's `error` prop expects.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validatePhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return 'Mobile number is required';
  if (digits.length < 10) return 'Mobile number must be 10 digits';
  if (digits.length > 10) return 'Mobile number must be exactly 10 digits';
  if (!/^[6-9]/.test(digits)) return 'Indian numbers start with 6, 7, 8 or 9';
  return undefined;
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Please enter your name';
  if (trimmed.length < 2) return 'That name looks too short';
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return 'Use letters only';
  return undefined;
}

/** Email is optional at signup — only validate it when something was typed. */
export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return undefined;
  if (!EMAIL_RE.test(trimmed)) return 'That email address looks incomplete';
  return undefined;
}

export function digitsOnly(value: string, maxLength = 10): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
