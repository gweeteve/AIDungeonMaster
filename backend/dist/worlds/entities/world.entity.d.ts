export declare class World {
    id: string;
    name: string;
    imageUrl?: string;
    gameSystemId: string;
    sessionData?: object;
    lastAccessedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    constructor(data?: Partial<World>);
    private generateUUID;
    updateLastAccessed(): void;
    updateSessionData(sessionData: object): void;
    toJSON(): {
        id: string;
        name: string;
        imageUrl: string | undefined;
        gameSystemId: string;
        sessionData: object | undefined;
        lastAccessedAt: string;
        createdAt: string;
        updatedAt: string;
    };
}
