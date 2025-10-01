// Game system entity type definitions
export interface GameSystem {
  id: string;
  name: string;
  defaultImageUrl: string;
  description?: string;
  rulesetConfig: object;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSystemResponse {
  id: string;
  name: string;
  defaultImageUrl: string;
  description?: string;
  isActive: boolean;
}

export interface GameSystemSummary {
  id: string;
  name: string;
  defaultImageUrl: string;
}