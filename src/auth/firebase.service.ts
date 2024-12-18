import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { ServiceAccount } from 'firebase-admin';
import { FirebaseAuthError } from './errors/firebase-auth.error';
import axios from 'axios';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      if (!admin.apps.length) {
        let serviceAccount: admin.ServiceAccount;

        // Use Firebase credentials URL directly
        const firebaseCredentialsUrl = 'https://firebasestorage.googleapis.com/v0/b/credmate-463b5.appspot.com/o/json%20cred%2Fcredmate-463b5-firebase-adminsdk-ff43d-b301168c51.json?alt=media&token=9570fa10-26ea-4d26-9bea-0f42be0e9434';
        this.logger.log('Firebase Credentials URL:', firebaseCredentialsUrl);

        try {
          // Download the Firebase credentials from the URL
          this.logger.log('Attempting to fetch Firebase credentials...');
          const response = await axios.get(firebaseCredentialsUrl);
          this.logger.log('Received response from credentials URL');
          
          // Handle the response data
          let credentialsData = response.data;
          
          // If the data is a string (JSON string), parse it
          if (typeof credentialsData === 'string') {
            try {
              credentialsData = JSON.parse(credentialsData);
            } catch (parseError) {
              this.logger.error('Failed to parse credentials JSON string', parseError);
              throw parseError;
            }
          }
          
          // Validate the required fields for ServiceAccount
          if (!credentialsData.project_id || !credentialsData.private_key || !credentialsData.client_email) {
            throw new Error('Invalid service account format: missing required fields');
          }

          serviceAccount = credentialsData as admin.ServiceAccount;
          this.logger.log('Service account data parsed successfully');

          // Initialize Firebase Admin with the service account credentials
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
          
          this.logger.log('Firebase Admin SDK initialized successfully');
        } catch (error) {
          this.logger.error('Failed to fetch Firebase credentials from URL', {
            error: error.message,
            stack: error.stack,
            response: error.response?.data
          });
          throw error;
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', {
        error: error.message,
        stack: error.stack
      });
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
