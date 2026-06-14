import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }

  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const derivedKey = scryptSync(password, salt, 64);

  if (hashBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(hashBuffer, derivedKey);
}
