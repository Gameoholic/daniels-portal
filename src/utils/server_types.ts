import "server-only";

export interface ServerExpense {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  payment_method: string;
  subscription_id: string | null;
  reimbursement_expected_amount: number;
  reimbursement_notes: string;
  reimbursement_income_ids: string[];
  timestamp: Date;
  deletion_timestamp: Date | null;
  last_edited_timestamp: Date | null;
  last_accessed_timestamp: Date;
  creation_timestamp: Date;
}

// todo - client can access this type..
export interface ServerUser {
  id: string;
  username: string;
  hashed_password: string;
  email: string;
  creation_timestamp: Date;
  last_login_timestamp: Date | null;
  default_token_expiry_seconds: number;
  max_tokens_at_a_time: number | null;
  deletion_timestamp: Date | null;
}

// todo - client can access this type..
export interface ServerAccessToken {
  token: string;
  user_id: string;
  creation_timestamp: Date;
  expiration_timestamp: Date;
  last_use_timestamp: Date | null;
  manually_revoked_timestamp: Date | null;
  automatically_revoked_timestamp: Date | null;
}

export type AccessTokenValidationResult =
  | { valid: true }
  | { valid: false; reason: AccessTokenInvalidReason };

export enum AccessTokenInvalidReason {
  EXPIRED,
  MANUALLY_REVOKED,
  AUTOMATICALLY_REVOKED,
}

export function isAccessTokenValid(
  token: ServerAccessToken
): AccessTokenValidationResult {
  if (token.manually_revoked_timestamp) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.MANUALLY_REVOKED,
    };
  }

  if (token.automatically_revoked_timestamp) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.AUTOMATICALLY_REVOKED,
    };
  }

  if (token.expiration_timestamp <= new Date()) {
    return {
      valid: false,
      reason: AccessTokenInvalidReason.EXPIRED,
    };
  }

  return { valid: true };
}

// todo - client can access this type..
export interface ServerAccountCreationCode {
  code: string;
  email: string;
  expiration_timestamp: Date;
  used_timestamp: Date | null;
  deletion_timestamp: Date | null;
}

// todo - client can access this type..
export interface ServerGymWeight {
  user_id: string;
  amount: number;
  timestamp: Date;
}

export interface ServerPermission {
  user_id: string;
  permission_name: string;
}

export type ServerDatabaseQueryResult<T> =
  | { success: true; result: T }
  | { success: false; errorString: string };
