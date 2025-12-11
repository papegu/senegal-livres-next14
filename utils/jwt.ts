// utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_change_me";
const key = new TextEncoder().encode(SECRET_KEY);

export interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
}

export async function signJwt(
  payload: JwtPayload,
  expiresIn: string = "7d"
): Promise<string> {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
