import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LENGTH = 64

export function hashGalleryPassword(password: string) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`
}

export function verifyGalleryPassword(password: string, storedHash: string) {
  if (storedHash.startsWith('scrypt$')) {
    const [, saltValue, hashValue] = storedHash.split('$')
    if (!saltValue || !hashValue) return false
    try {
      const expected = Buffer.from(hashValue, 'base64url')
      const actual = scryptSync(password, Buffer.from(saltValue, 'base64url'), expected.length)
      return expected.length === actual.length && timingSafeEqual(expected, actual)
    } catch {
      return false
    }
  }

  // Compatibility with existing galleries. Successful legacy logins are re-hashed.
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) return false
  const expected = Buffer.from(storedHash.toLowerCase(), 'utf8')
  const actual = Buffer.from(createHash('sha256').update(password).digest('hex'), 'utf8')
  return timingSafeEqual(expected, actual)
}
