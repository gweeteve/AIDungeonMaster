import {
  GameSystem,
  CreateGameSystemRequest,
  UpdateGameSystemRequest,
  GameSystemQueryOptions,
  PaginatedGameSystemsResponse,
  EditLock,
  ApiError,
} from '@/types/game-system.types';

class GameSystemService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  private getAuthHeaders(): HeadersInit {
    // TODO: Implement proper authentication
    return {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getAuthToken()}`,
    };
  }

  async getGameSystems(options: GameSystemQueryOptions = {}): Promise<PaginatedGameSystemsResponse> {
    const searchParams = new URLSearchParams();
    
    if (options.page) searchParams.set('page', options.page.toString());
    if (options.limit) searchParams.set('limit', options.limit.toString());
    if (options.search) searchParams.set('search', options.search);
    if (options.ownerId) searchParams.set('ownerId', options.ownerId);

    const url = `${this.baseUrl}/api/game-systems?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<PaginatedGameSystemsResponse>(response);
  }

  async getGameSystem(id: string): Promise<GameSystem> {
    const response = await fetch(`${this.baseUrl}/api/game-systems/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<GameSystem>(response);
  }

  async createGameSystem(data: CreateGameSystemRequest): Promise<GameSystem> {
    const response = await fetch(`${this.baseUrl}/api/game-systems`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<GameSystem>(response);
  }

  async updateGameSystem(id: string, data: UpdateGameSystemRequest): Promise<GameSystem> {
    const response = await fetch(`${this.baseUrl}/api/game-systems/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<GameSystem>(response);
  }

  async deleteGameSystem(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/game-systems/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `Failed to delete game system`);
    }
  }

  async acquireLock(id: string): Promise<EditLock> {
    const response = await fetch(`${this.baseUrl}/api/game-systems/${id}/lock`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<EditLock>(response);
  }

  async releaseLock(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/game-systems/${id}/lock`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || `Failed to release lock`);
    }
  }

  // Utility methods
  async searchGameSystems(query: string, limit = 10): Promise<GameSystem[]> {
    const response = await this.getGameSystems({ search: query, limit });
    return response.data;
  }

  async getGameSystemsByOwner(ownerId: string): Promise<GameSystem[]> {
    const response = await this.getGameSystems({ ownerId, limit: 100 });
    return response.data;
  }

  async getDerivedSystems(parentId: string): Promise<GameSystem[]> {
    // This would be implemented by filtering systems with parentSystemId
    const allSystems = await this.getGameSystems({ limit: 1000 });
    return allSystems.data.filter(system => system.parentSystemId === parentId);
  }

  // Validation helpers
  isValidGameSystemName(name: string): boolean {
    return name.length >= 1 && name.length <= 100;
  }

  isValidDescription(description?: string): boolean {
    return !description || description.length <= 500;
  }

  isValidImageUrl(url?: string): boolean {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Format helpers
  formatGameSystemForDisplay(gameSystem: GameSystem): string {
    const parts = [gameSystem.name];
    if (gameSystem.description) {
      parts.push(`- ${gameSystem.description}`);
    }
    if (gameSystem.parentSystem) {
      parts.push(`(derived from ${gameSystem.parentSystem.name})`);
    }
    return parts.join(' ');
  }

  getGameSystemImageUrl(gameSystem: GameSystem): string {
    return gameSystem.imageUrl || '/images/default-game-system.png';
  }

  isLocked(gameSystem: GameSystem): boolean {
    if (!gameSystem.editLockUserId || !gameSystem.editLockExpiresAt) {
      return false;
    }
    return new Date(gameSystem.editLockExpiresAt) > new Date();
  }

  isLockedByCurrentUser(gameSystem: GameSystem, currentUserId: string): boolean {
    return this.isLocked(gameSystem) && gameSystem.editLockUserId === currentUserId;
  }

  getLockTimeRemaining(gameSystem: GameSystem): number | null {
    if (!gameSystem.editLockExpiresAt) return null;
    
    const expiresAt = new Date(gameSystem.editLockExpiresAt);
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();
    
    return remaining > 0 ? remaining : 0;
  }

  formatLockTimeRemaining(gameSystem: GameSystem): string | null {
    const remaining = this.getLockTimeRemaining(gameSystem);
    if (remaining === null) return null;
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Export singleton instance
export const gameSystemService = new GameSystemService();
export default gameSystemService;