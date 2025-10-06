// World entity type definitions
export interface World {
  id: string;
  name: string;
  imageUrl?: string;
  gameSystemId: string;
  sessionData?: object;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorldRequest {
  name: string;           // 1-255 chars, UTF-8
  gameSystemId: string;   // Must exist in DB
  imageUrl?: string;      // Valid URL or undefined
}

export interface WorldResponse {
  id: string;
  name: string;
  imageUrl?: string;
  gameSystem: {
    id: string;
    name: string;
    defaultImageUrl: string;
  };
  lastAccessedAt: string; // ISO date
  createdAt: string;      // ISO date
}

export interface LaunchResponse {
  worldId: string;
  launchUrl: string;
  lastAccessedAt: string;
}