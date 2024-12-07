import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../../auth/firebase.service';

@Injectable()
export class AuthGuardFactory {
  constructor(
    private readonly firebaseService: FirebaseService,
  ) {}

  createAuthGuard() {
    return {
      canActivate: async (context: any) => {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
          throw new UnauthorizedException('No token provided');
        }

        try {
          const decodedToken = await this.firebaseService.verifyIdToken(token);
          
          // Add user data to request
          request.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            phoneNumber: decodedToken.phone_number,
            name: decodedToken.name,
            picture: decodedToken.picture,
          };
          
          return true;
        } catch (error) {
          throw new UnauthorizedException('Invalid token');
        }
      },
    };
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
