import { SignOptions } from 'jsonwebtoken';
import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-here';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-key';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'your-cookie-secret-key';

// JWT options type-safe configuration
export const jwtOptions = {
    expiresIn: JWT_EXPIRES_IN
} as SignOptions;

export const refreshTokenOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
} as SignOptions;