import { PrismaService } from '../database/prisma/prisma.service';
import { FirebaseService } from '../auth/firebase.service';
import { AuthService } from '../auth/auth.service';
import { CustomJwtPayload } from '../auth/auth.service';
import { BaseService } from '../common/base/base.service';
import { UserProfileResponse } from './interfaces/user-profile.interface';
export declare class UpdateUserProfileDto {
    name?: string;
    date_of_birth?: string;
    businessType?: string;
}
export declare class UserService extends BaseService {
    protected readonly prismaService: PrismaService;
    private readonly firebaseService;
    private readonly authService;
    constructor(prismaService: PrismaService, firebaseService: FirebaseService, authService: AuthService);
    getUserProfile(token: string): Promise<UserProfileResponse>;
    updateUserProfile(decodedToken: CustomJwtPayload, userData: UpdateUserProfileDto): Promise<UserProfileResponse>;
    private filterUpdateData;
}
