import { IsString, IsOptional, IsUUID, IsObject, IsBoolean, IsUrl, Length } from 'class-validator';

export class GameSystem {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100, { message: 'Game system name must be between 1 and 100 characters' })
  name: string;

  @IsUrl({}, { message: 'Default image URL must be a valid URL' })
  @IsString()
  defaultImageUrl: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must be 1000 characters or less' })
  description?: string;

  @IsObject()
  rulesetConfig: object;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;

  constructor(data: Partial<GameSystem> = {}) {
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
    if (this.isActive === undefined) {
      this.isActive = true;
    }
    if (!this.rulesetConfig) {
      this.rulesetConfig = {};
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  updateRuleset(rulesetConfig: object): void {
    this.rulesetConfig = rulesetConfig;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      defaultImageUrl: this.defaultImageUrl,
      description: this.description,
      rulesetConfig: this.rulesetConfig,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }

  toSummary() {
    return {
      id: this.id,
      name: this.name,
      defaultImageUrl: this.defaultImageUrl
    };
  }

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      defaultImageUrl: this.defaultImageUrl,
      description: this.description,
      isActive: this.isActive
    };
  }
}