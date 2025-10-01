export declare class ValidationService {
    private ajv;
    constructor();
    validateJson(data: any, schema: object): Promise<string[]>;
    private formatValidationErrors;
    isValidJsonSchema(schema: any): boolean;
    validateGameSystemSchema(schema: object): Promise<string[]>;
    getCommonRpgSchemas(): Record<string, object>;
}
