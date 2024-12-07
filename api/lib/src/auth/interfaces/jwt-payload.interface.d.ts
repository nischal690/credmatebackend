export interface CustomJwtPayload {
    uid: string;
    uniqueId: string;
    email?: string;
    phoneNumber?: string;
    name?: string;
    iat?: number;
    exp?: number;
}
