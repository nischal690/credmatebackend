export class FirebaseAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'FirebaseAuthError';
    Object.setPrototypeOf(this, FirebaseAuthError.prototype);
  }
}
