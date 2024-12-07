import { AuthService } from '../../auth/auth.service';
import { FirebaseService } from '../../auth/firebase.service';
export declare class AuthGuardFactory {
    private readonly authService;
    private readonly firebaseService;
    constructor(authService: AuthService, firebaseService: FirebaseService);
    createAuthGuard(type: 'jwt' | 'firebase'): {
        canActivate: (context: any) => Promise<boolean>;
    };
    private extractToken;
}
