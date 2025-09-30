import { IsString, IsOptional, IsUUID, IsObject, IsDateString, Length } from 'class-validator';

export class World {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 255, { message: 'World name must be between 1 and 255 characters' })
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsUUID()
  gameSystemId: string;

  @IsOptional()
  @IsObject()
  sessionData?: object;

  @IsDateString()
  lastAccessedAt: Date;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  constructor(data: Partial<World> = {}) {
    Object.assign(this, data);
    
    if (!this.id) {
      this.id = this.generateUUID();
    }
    
    const now = new Date();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    if (!this.updatedAt) {
      this.updatedAt = now;
    }
    if (!this.lastAccessedAt) {
      this.lastAccessedAt = now;
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  updateLastAccessed(): void {
    this.lastAccessedAt = new Date();
    this.updatedAt = new Date();
  }

  updateSessionData(sessionData: object): void {
    this.sessionData = sessionData;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      imageUrl: this.imageUrl,
      gameSystemId: this.gameSystemId,
      sessionData: this.sessionData,
      lastAccessedAt: this.lastAccessedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}