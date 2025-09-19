export type PhoneValidationResult = {
  valid: boolean;
  normalized: string | null; 
  type: 'local' | 'international' | null;
  error?: string;
};

export function validateVietnamPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, normalized: null, type: null, error: 'Invalid phone number' };
  }

  // normalize: remove spaces, dots, dashes, parentheses
  let s = input.trim().replace(/[\s\.\-\(\)]/g, '');

  // Regex for mobile numbers only
  const localRegex = /^0(3\d|5\d|7\d|8\d|9\d)\d{7}$/;        // 10 digits total
  const intlRegex  = /^(?:\+?84)(3\d|5\d|7\d|8\d|9\d)\d{7}$/; // +84 + 9 digits

  // Local form → normalize to +84...
  if (localRegex.test(s)) {
    return { valid: true, normalized: '+84' + s.substring(1), type: 'local' };
  }

  // International form
  if (intlRegex.test(s)) {
    const normalized = s.startsWith('+') ? s : '+' + s;
    return { valid: true, normalized, type: 'international' };
  }

  // Fail
  return { valid: false, normalized: null, type: null, error: 'Invalid phone number' };
}
