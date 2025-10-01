export declare class CreateGameSystemRequest {
    name: string;
    defaultImageUrl: string;
    description?: string;
    rulesetConfig?: object;
    isActive?: boolean;
}
export declare class UpdateGameSystemRequest {
    name?: string;
    defaultImageUrl?: string;
    description?: string;
    rulesetConfig?: object;
    isActive?: boolean;
}
export declare class GameSystemResponse {
    id: string;
    name: string;
    defaultImageUrl: string;
    description?: string;
    isActive: boolean;
}
export declare class GameSystemSummary {
    id: string;
    name: string;
    defaultImageUrl: string;
}
export declare class ErrorResponse {
    message: string;
    details?: object;
    statusCode: number;
}
