# Utils - Token Generator

## Overview
Utility functions untuk generate dan manage tokens untuk email verification dan password reset.

## Functions

### `generateId(prefix, length)`
Generate random ID dengan format custom.

**Parameters:**
- `prefix` (string) - Prefix untuk ID (default: 'ET')
- `length` (number) - Panjang random part (default: 4)

**Returns:** String ID dengan format PREFIX + random numbers

**Example:**
```javascript
const id = generateId('ET', 4);
// Output: "ET0123"
```

---

### `generateSecureToken(bytes)`
Generate secure random token menggunakan crypto.randomBytes.

**Parameters:**
- `bytes` (number) - Jumlah bytes (default: 32)

**Returns:** Hex string token

**Example:**
```javascript
const token = generateSecureToken(32);
// Output: "a1b2c3d4e5f6..."
```

---

### `generateUrlSafeToken(bytes)`
Generate URL-safe token (Base64 encoded).

**Parameters:**
- `bytes` (number) - Jumlah bytes (default: 32)

**Returns:** Base64 URL-safe token

**Example:**
```javascript
const token = generateUrlSafeToken(32);
// Output: "abc123-xyz789_"
```

---

### `hashToken(token)`
Hash token menggunakan SHA-256 untuk disimpan di database.

**Parameters:**
- `token` (string) - Token yang akan di-hash

**Returns:** Hashed token (hex string)

**Example:**
```javascript
const hashed = hashToken('mytoken123');
// Output: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
```

---

### `generateExpirationTime(duration)`
Generate expiration time dari duration string.

**Parameters:**
- `duration` (string) - Duration string (e.g., '24h', '1h', '30m')

**Returns:** Date object

**Example:**
```javascript
const expires = generateExpirationTime('24h');
// Output: Date 24 hours from now

const expires2 = generateExpirationTime('30m');
// Output: Date 30 minutes from now
```

**Supported formats:**
- `h` - hours (e.g., '24h', '1h')
- `m` - minutes (e.g., '30m', '5m')
- `d` - days (e.g., '7d', '1d')

---

### `isTokenExpired(expiresAt)`
Check apakah token sudah expired.

**Parameters:**
- `expiresAt` (Date) - Expiration date

**Returns:** Boolean (true if expired)

**Example:**
```javascript
const expired = isTokenExpired(new Date('2026-01-01'));
// Output: true (if current date > 2026-01-01)
```

---

### `generateEmailToken(idAkun, type, duration)`
Generate complete email token object dengan semua data yang diperlukan.

**Parameters:**
- `idAkun` (string) - ID akun
- `type` (string) - Token type ('VERIFY' or 'RESET')
- `duration` (string) - Duration string (optional, default: '24h' for VERIFY, '1h' for RESET)

**Returns:** Object dengan properties:
- `id_token` - ID token untuk database
- `id_akun` - ID akun
- `token` - Plain token (kirim ke email)
- `hashedToken` - Hashed token (simpan di database)
- `type` - Token type
- `expiresAt` - Expiration date

**Example:**
```javascript
const tokenData = generateEmailToken('S00001', 'VERIFY');

// Output:
{
  id_token: 'ET0123',
  id_akun: 'S00001',
  token: 'a1b2c3d4e5f6...',
  hashedToken: '5e884898da28...',
  type: 'VERIFY',
  expiresAt: Date (24 hours from now)
}

// Save to database
await db.query(
  'INSERT INTO email_tokens (id_token, id_akun, token, type, expires_at) VALUES (?, ?, ?, ?, ?)',
  [tokenData.id_token, tokenData.id_akun, tokenData.hashedToken, tokenData.type, tokenData.expiresAt]
);

// Send email with plain token
await sendVerificationEmail(email, nama, `${FRONTEND_URL}/verify?token=${tokenData.token}`);
```

---

### `generateOTP(length)`
Generate numeric OTP code.

**Parameters:**
- `length` (number) - Length of OTP (default: 6)

**Returns:** String numeric OTP

**Example:**
```javascript
const otp = generateOTP(6);
// Output: "123456"
```

---

### `verifyToken(token, hashedToken)`
Verify apakah plain token match dengan hashed token dari database.

**Parameters:**
- `token` (string) - Plain token dari user
- `hashedToken` (string) - Hashed token dari database

**Returns:** Boolean (true if match)

**Example:**
```javascript
// User provides token from email
const userToken = 'a1b2c3d4e5f6...';

// Get hashed token from database
const [rows] = await db.query('SELECT token FROM email_tokens WHERE id_token = ?', ['ET0123']);
const dbHashedToken = rows[0].token;

// Verify
if (verifyToken(userToken, dbHashedToken)) {
  console.log('Token valid!');
} else {
  console.log('Token invalid!');
}
```

---

## Usage Examples

### Email Verification Flow

```javascript
const { generateEmailToken, isTokenExpired, verifyToken } = require('./utils/tokenGenerator');

// 1. Generate token saat register
const tokenData = generateEmailToken(id_akun, 'VERIFY', '24h');

// 2. Save to database (hashed)
await db.query(
  'INSERT INTO email_tokens (id_token, id_akun, token, type, expires_at) VALUES (?, ?, ?, ?, ?)',
  [tokenData.id_token, tokenData.id_akun, tokenData.hashedToken, tokenData.type, tokenData.expiresAt]
);

// 3. Send email (plain token)
const link = `${FRONTEND_URL}/verify-email?token=${tokenData.token}`;
await sendVerificationEmail(email, nama, link);

// 4. Verify token dari user
const userToken = req.body.token;

// Get all unused tokens
const [tokens] = await db.query(
  'SELECT * FROM email_tokens WHERE type = "VERIFY" AND is_used = FALSE'
);

// Find matching token
let matchedToken = null;
for (const dbToken of tokens) {
  if (verifyToken(userToken, dbToken.token)) {
    matchedToken = dbToken;
    break;
  }
}

if (!matchedToken) {
  return res.status(400).json({ error: 'Token tidak valid' });
}

// Check expiration
if (isTokenExpired(matchedToken.expires_at)) {
  return res.status(400).json({ error: 'Token expired' });
}

// Mark as used
await db.query('UPDATE email_tokens SET is_used = TRUE WHERE id_token = ?', [matchedToken.id_token]);

// Update account
await db.query('UPDATE akun_ppdb SET is_email_verified = TRUE WHERE id_akun = ?', [matchedToken.id_akun]);
```

### Password Reset Flow

```javascript
// 1. Generate reset token
const tokenData = generateEmailToken(id_akun, 'RESET', '1h');

// 2. Save to database
await db.query(
  'INSERT INTO email_tokens (id_token, id_akun, token, type, expires_at) VALUES (?, ?, ?, ?, ?)',
  [tokenData.id_token, tokenData.id_akun, tokenData.hashedToken, tokenData.type, tokenData.expiresAt]
);

// 3. Send reset email
const link = `${FRONTEND_URL}/reset-password?token=${tokenData.token}`;
await sendPasswordResetEmail(email, link);

// 4. Reset password
const userToken = req.body.token;
const newPassword = req.body.newPassword;

// Verify token (same as verification flow)
// ... verify token logic ...

// Update password
const hashedPassword = await bcrypt.hash(newPassword, 10);
await db.query('UPDATE akun_ppdb SET password = ? WHERE id_akun = ?', [hashedPassword, matchedToken.id_akun]);

// Mark token as used
await db.query('UPDATE email_tokens SET is_used = TRUE WHERE id_token = ?', [matchedToken.id_token]);
```

---

## Security Notes

1. **Never store plain tokens in database** - Always hash with `hashToken()`
2. **Use secure random generation** - `crypto.randomBytes()` is cryptographically secure
3. **Set appropriate expiration times** - Verification: 24h, Reset: 1h
4. **One-time use tokens** - Mark as used after verification
5. **Verify token expiration** - Always check `isTokenExpired()` before accepting token

---

## Testing

```javascript
const {
  generateId,
  generateSecureToken,
  hashToken,
  generateExpirationTime,
  isTokenExpired,
  generateEmailToken,
  verifyToken,
} = require('./utils/tokenGenerator');

// Test ID generation
console.log(generateId('ET', 4)); // ET0123

// Test token generation
const token = generateSecureToken(32);
console.log('Token:', token);

// Test hashing
const hashed = hashToken(token);
console.log('Hashed:', hashed);

// Test verification
console.log('Verify:', verifyToken(token, hashed)); // true

// Test expiration
const expires = generateExpirationTime('1h');
console.log('Expires:', expires);
console.log('Is expired:', isTokenExpired(expires)); // false

// Test complete token generation
const tokenData = generateEmailToken('S00001', 'VERIFY');
console.log('Token data:', tokenData);
```

---

## Dependencies

- `crypto` - Node.js built-in module (no installation needed)

---

**Last Updated:** May 6, 2026  
**Version:** 1.0.0
