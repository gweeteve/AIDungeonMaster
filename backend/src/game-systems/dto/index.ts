import { IsString, IsOptional, IsObject, IsBoolean, IsUrl, Length, IsInt } from 'class-validator';

export class CreateGameSystemRequest {
  @IsString()
  @Length(1, 100, { message: 'Game system name must be between 1 and 100 characters' })
  name!: string;

  @IsUrl({}, { message: 'Default image URL must be a valid URL' })
  defaultImageUrl!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must be 1000 characters or less' })
  description?: string;

  @IsOptional()
  @IsObject()
  rulesetConfig?: object;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateGameSystemRequest {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Game system name must be between 1 and 100 characters' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Default image URL must be a valid URL' })
  defaultImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Description must be 1000 characters or less' })
  description?: string;

  @IsOptional()
  @IsObject()
  rulesetConfig?: object;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class GameSystemResponse {
  id!: string;
  name!: string;
  defaultImageUrl!: string;
  description?: string;
  isActive!: boolean;
}

export class GameSystemSummary {
  id!: string;
  name!: string;
  defaultImageUrl!: string;
}

export class ErrorResponse {
  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  details?: object;

  @IsInt()
  statusCode!: number;
}