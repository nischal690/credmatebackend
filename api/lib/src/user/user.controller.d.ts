import { UserService } from './user.service';
import { UserProfileResponse } from './interfaces/user-profile.interface';
export declare class UpdateUserProfileDto {
    name: string;
    date_of_birth?: string;
    businessType: string;
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getUserProfile(req: any): Promise<UserProfileResponse>;
    updateProfile(req: any, updateUserProfileDto: UpdateUserProfileDto): Promise<UserProfileResponse>;
}
