export declare class GameSystem {
    id: string;
    name: string;
    defaultImageUrl: string;
    description?: string;
    rulesetConfig: object;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(data?: Partial<GameSystem>);
    private generateUUID;
    activate(): void;
    deactivate(): void;
    updateRuleset(rulesetConfig: object): void;
    updateDescription(description: string): void;
    toJSON(): {
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        rulesetConfig: object;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
    toSummary(): {
        id: string;
        name: string;
        defaultImageUrl: string;
    };
    toResponse(): {
        id: string;
        name: string;
        defaultImageUrl: string;
        description: string | undefined;
        isActive: boolean;
    };
}
