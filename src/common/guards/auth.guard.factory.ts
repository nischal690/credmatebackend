import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { FirebaseService } from '../../auth/firebase.service';

@Injectable()
export class AuthGuardFactory {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
  ) {}

  createAuthGuard(type: 'jwt' | 'firebase') {
    return {
      canActivate: async (context: any) => {
        const request = context.switchToHttp().getRequest();
        const token = this.extractToken(request);

        if (!token) {
          throw new UnauthorizedException('No token provided');
        }

        try {
          if (type === 'jwt') {
            request.user = await this.authService.verifyCustomToken(token);
          } else {
            request.user = await this.firebaseService.verifyIdToken(token);
          }
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
