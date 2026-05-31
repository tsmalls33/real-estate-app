import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function seedPasswordHash(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

