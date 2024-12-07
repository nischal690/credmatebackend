import { AuthService } from './auth.service';
export declare class GenerateTokenDto {
    idToken: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    generateToken(body: GenerateTokenDto): Promise<{
        timestamp: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
        refreshTokenExpiresIn: number;
        success: boolean;
    }>;
    refreshToken(body: RefreshTokenDto): Promise<{
        timestamp: string;
        accessToken: string;
        refreshToken: string;
        accessTokenExpiresIn: number;
        refreshTokenExpiresIn: number;
        success: boolean;
    }>;
}
