/// <reference types="node" />
/// <reference types="node" />
export declare class ImageUtils {
    static convertToJpeg(imageBuffer: Buffer): Promise<Buffer>;
    static validateImage(imageBuffer: Buffer): Promise<void>;
}
