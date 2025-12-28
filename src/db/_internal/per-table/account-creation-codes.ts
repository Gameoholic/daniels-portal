export interface ServerAccountCreationCode {
  code: string;
  email: string;
  account_default_token_expiry_seconds: number;
  expiration_timestamp: Date;
  used_timestamp: Date | null;
  deletion_timestamp: Date | null;
}
