import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import db from "./db";
import type { Role, User } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "bshewam-school-secret-key-2024";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const user = db.users.find((u) => u.email === email);
  if (!user) return null;

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) return null;

  return user;
}

export function getUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}
