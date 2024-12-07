import { ExecutionContext, CanActivate } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
export declare class FirebaseAuthGuard implements CanActivate {
    private readonly firebaseService;
    private readonly logger;
    constructor(firebaseService: FirebaseService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
