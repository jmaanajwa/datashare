export type ExpirationOption = '1' | '7';

export interface ShareOptions {
  password: string;
  expiration: ExpirationOption;
}

export interface ShareResult {
  link: string;
  expiresAt: Date;
}
