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
  // Warn about weak JWT secrets
  if (!SECRET_KEY || SECRET_KEY === "dev_secret_change_me" || SECRET_KEY.length < 32) {
    console.warn("[JWT] WARNING: JWT_SECRET is weak or default. Use a strong random secret (32+ characters) in production!");
  }
  
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    if (!token) {
      console.warn("[JWT] No token provided");
      return null;
    }
    
    const { payload } = await jwtVerify(token, key);
    
    // Validate payload structure
    if (!payload.sub || !payload.email) {
      console.warn("[JWT] Invalid payload structure:", payload);
      return null;
    }
    
    return payload as unknown as JwtPayload;
  } catch (error) {
    // Log specific error types for debugging
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        console.warn("[JWT] Token expired");
      } else if (error.message.includes('signature')) {
        console.warn("[JWT] Invalid signature");
      } else {
        console.warn("[JWT] Verification failed:", error.message);
      }
    }
    return null;
  }
}
