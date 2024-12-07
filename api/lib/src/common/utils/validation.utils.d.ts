export declare class ValidationUtils {
    static validateDTO(dto: any): Promise<void>;
    static validateRequiredFields(obj: any, requiredFields: string[]): void;
}
