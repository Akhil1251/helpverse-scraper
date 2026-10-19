import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Default admin credentials (bcrypt hashed with 12 rounds)
const DEFAULT_ADMIN_EMAIL = "Admin@helpverse.in";
const DEFAULT_PASSWORD_HASH = "$2b$12$nTIPctsR/I4h.WbXcyMKPuxIGvVskaxagrJQtUUCiXoqmitn4KF1y"; // Hash of Admin@2527
const DEFAULT_JWT_SECRET = "helpverse_super_secret_jwt_key_2026_98234710928374918237491";

export const AUTH_COOKIE_NAME = "helpverse_auth_token";

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

export function getPasswordHash(): string {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (
    envHash &&
    (envHash.startsWith("$2a$") || envHash.startsWith("$2b$") || envHash.startsWith("$2y$"))
  ) {
    return envHash;
  }
  return DEFAULT_PASSWORD_HASH;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

/**
 * Validates user-submitted credentials against environment & bcrypt hash
 */
export async function verifyAdminCredentials(
  emailInput: string,
  passwordInput: string
): Promise<boolean> {
  const targetEmail = getAdminEmail().toLowerCase().trim();
  const submittedEmail = (emailInput || "").toLowerCase().trim();

  if (targetEmail !== submittedEmail) {
    return false;
  }

  const hash = getPasswordHash();
  return bcrypt.compare(passwordInput, hash);
}

/**
 * Signs a JWT session token for authenticated user
 */
export function generateAuthToken(email: string): string {
  return jwt.sign(
    {
      sub: email,
      role: "admin",
      iss: "helpverse-scraper",
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

/**
 * Verifies and decodes an auth token
 */
export function verifyAuthToken(token?: string): { email: string; role: string } | null {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    if (decoded && decoded.sub) {
      return {
        email: decoded.sub,
        role: decoded.role || "admin",
      };
    }
    return null;
  } catch {
    return null;
  }
}
