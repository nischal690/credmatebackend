import * as jwt from 'jsonwebtoken';

interface CustomJwtPayload {
  uid: string;
  email?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
}

export function generateTestToken(jwtSecret: string = 'your-test-secret-key'): string {
  // Create a dummy payload that matches your token structure
  const dummyPayload: CustomJwtPayload = {
    uid: 'test-user-123',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    emailVerified: true,
    name: 'Test User',
    picture: 'https://example.com/test-user.jpg'
  };

  // Generate the token with the exact same configuration as your AuthService
  const token = jwt.sign(dummyPayload, jwtSecret, {
    expiresIn: '1d', // Set a long expiration for testing
    algorithm: 'HS256',
    audience: process.env.JWT_AUDIENCE || 'test-audience',
    issuer: process.env.JWT_ISSUER || 'test-issuer',
    notBefore: 0
  });

  return token;
}

// Generate and log a test token if this file is run directly
if (require.main === module) {
  const token = generateTestToken();
  console.log('Test JWT Token:');
  console.log(token);
  
  // Also decode and display the token for verification
  const decoded = jwt.decode(token);
  console.log('\nDecoded Token:');
  console.log(JSON.stringify(decoded, null, 2));
  
  console.log('\nTo use this token in your API requests:');
  console.log('Authorization: Bearer ' + token);
}
