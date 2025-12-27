export interface ServerAccountCreationCode {
  code: string;
  email: string;
  expiration_timestamp: Date;
  used_timestamp: Date | null;
  deletion_timestamp: Date | null;
}
