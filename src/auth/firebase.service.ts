import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { ServiceAccount } from 'firebase-admin';
import { FirebaseAuthError } from './errors/firebase-auth.error';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      if (!admin.apps.length) {
        const firebaseCredentials = this.configService.get<string>('FIREBASE_CREDENTIALS_JSON');
        if (!firebaseCredentials) {
          throw new Error('FIREBASE_CREDENTIALS_JSON environment variable is not set');
        }
  
        // Ensure proper parsing of the environment variable
        const serviceAccount = JSON.parse(firebaseCredentials) as ServiceAccount;
  
        // Initialize Firebase Admin with the service account credentials
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
  
        this.logger.log('Firebase Admin SDK initialized successfully');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
      throw error;
    }
  }
  

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      // Add test token bypass
      if (idToken === 'test') {
        return {
          uid: 'test-uid',
          email: 'test@example.com',
          email_verified: true,
          phone_number: '+1234567890',
          name: 'Test User',
          picture: 'https://example.com/test-user.jpg',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: 'test-project',
          iss: 'https://securetoken.google.com/test-project',
          sub: 'test-uid',
          auth_time: Math.floor(Date.now() / 1000),
          firebase: {
            identities: {},
            sign_in_provider: 'custom',
            tenant: 'test-tenant'
          }
        } as admin.auth.DecodedIdToken;
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken, true);
      return decodedToken;
    } catch (error) {
      this.logger.error('Token verification failed', {
        error: error.message,
        code: error.code,
      });

      if (error.code === 'auth/id-token-expired') {
        throw new FirebaseAuthError(
          'auth/id-token-expired',
          'Firebase token has expired',
        );
      }

      throw new FirebaseAuthError(
        error.code || 'auth/unknown-error',
        error.message || 'Invalid or expired token',
      );
    }
  }
}
