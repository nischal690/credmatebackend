import { FirebaseService } from './firebase.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma/prisma.service';
export interface CustomJwtPayload {
    uid: string;
    phoneNumber: string;
    uniqueId: string;
    email?: string;
    name?: string;
}
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}
export declare class TokenValidationError extends Error {
    readonly code: string;
    readonly details?: any;
    constructor(code: string, message: string, details?: any);
}
export declare class AuthService {
    private readonly firebaseService;
    private readonly configService;
    private readonly prismaService;
    private readonly logger;
    private readonly jwtSecret;
    private readonly jwtExpiresIn;
    private readonly refreshTokenSecret;
    private readonly refreshTokenExpiresIn;
    constructor(firebaseService: FirebaseService, configService: ConfigService, prismaService: PrismaService);
    private getRequiredConfig;
    generateUniqueId(phoneNumber: string): string;
    private generateTokens;
    private parseTimeToSeconds;
    validateFirebaseToken(idToken: string): Promise<TokenResponse>;
    refreshAccessToken(refreshToken: string): Promise<TokenResponse>;
    verifyCustomToken(token: string): Promise<CustomJwtPayload>;
}
