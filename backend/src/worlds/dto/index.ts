import { IsString, IsOptional, IsUUID, Length, IsUrl, IsInt, IsObject } from 'class-validator';

export class CreateWorldRequest {
  @IsString()
  @Length(1, 255, { message: 'World name must be between 1 and 255 characters' })
  name!: string;

  @IsUUID(4, { message: 'Game system ID must be a valid UUID' })
  gameSystemId!: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;
}

export class UpdateWorldRequest {
  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'World name must be between 1 and 255 characters' })
  name?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @IsOptional()
  sessionData?: object;
}

export class WorldResponse {
  id!: string;
  name!: string;
  imageUrl?: string;
  gameSystem!: {
    id: string;
    name: string;
    defaultImageUrl: string;
  };
  lastAccessedAt!: string;
  createdAt!: string;
}

export class LaunchResponse {
  worldId!: string;
  launchUrl!: string;
  lastAccessedAt!: string;
}

export class ErrorResponse {
  @IsString()
  message!: string;

  @IsInt()
  statusCode!: number;

  @IsOptional()
  @IsObject()
  details?: object;
}