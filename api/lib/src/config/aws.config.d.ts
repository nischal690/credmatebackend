declare const _default: (() => {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    rekognition: {
        collectionId: string;
        faceMatchThreshold: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    rekognition: {
        collectionId: string;
        faceMatchThreshold: number;
    };
}>;
export default _default;
