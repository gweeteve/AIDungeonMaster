export declare class CreateWorldRequest {
    name: string;
    gameSystemId: string;
    imageUrl?: string;
}
export declare class UpdateWorldRequest {
    name?: string;
    imageUrl?: string;
    sessionData?: object;
}
export declare class WorldResponse {
    id: string;
    name: string;
    imageUrl?: string;
    gameSystem: {
        id: string;
        name: string;
        defaultImageUrl: string;
    };
    lastAccessedAt: string;
    createdAt: string;
}
export declare class LaunchResponse {
    worldId: string;
    launchUrl: string;
    lastAccessedAt: string;
}
export declare class ErrorResponse {
    message: string;
    statusCode: number;
    details?: object;
}
