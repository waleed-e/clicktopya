/**
 * Validation utilities for Egyptian phone numbers and emails
 */

/**
 * Normalizes and validates an Egyptian mobile phone number.
 * Supported prefixes: 010, 011, 012, 015
 * Length: 11 digits
 * Accepts:
 *   - 01011643099
 *   - +201011643099
 *   - 00201011643099
 *   - 201011643099
 * Returns normalized 11-digit string '01011643099' or null if invalid.
 */
function normalizeEgyptianPhone(phone) {
  if (!phone || typeof phone !== 'string') return null;

  // Remove all non-digit characters except leading plus
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  }

  // Egyptian mobile regex: starts with 01 followed by 0, 1, 2, or 5 and 8 digits
  const egPhoneRegex = /^01[0125][0-9]{8}$/;

  if (egPhoneRegex.test(cleaned)) {
    return cleaned;
  }

  return null;
}

/**
 * Validates and normalizes email address.
 * Rejects invalid format or incomplete domains.
 */
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return null;

  const cleaned = email.trim().toLowerCase();
  // Standard RFC-compatible email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (emailRegex.test(cleaned)) {
    return cleaned;
  }

  return null;
}

module.exports = {
  normalizeEgyptianPhone,
  normalizeEmail
};
