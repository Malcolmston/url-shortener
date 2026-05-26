/** Shared TypeScript types for the Snip application */

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinkRecord {
  id: number;
  slug: string;
  originalUrl: string;
  userId: number | null;
  shortUrl?: string;
  redirectType: '301' | '302' | '307';
  hasPreview: boolean;
  isPasswordProtected: boolean;
  expiresAt: string | null;
  isActive: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  isExpired: boolean;
}

export interface FileRecord {
  id: number;
  uuid: string;
  name: string;
  type: string;
  visibility: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ApiKeyRecord {
  id: number;
  keyPrefix: string;
  label: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface UserSessionRecord {
  id: number;
  sessionId: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastActivityAt: string;
  createdAt: string;
}

export interface ClickRecord {
  id: number;
  linkId: number;
  device: string | null;
  os: string | null;
  browser: string | null;
  referrer: string | null;
  createdAt: string;
}
