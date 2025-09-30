// Common API types
export interface ErrorResponse {
  message: string;
  statusCode: number;
  details?: object;
}

// Re-export all types for convenience
export * from './world';
export * from './game-system';