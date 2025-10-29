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
  deletion_timestamp: Date | null;
}

// todo - client can access this type..
export interface ServerAccessToken {
  token: string;
  user_id: string;
  expiration_timestamp: Date;
  last_use_timestamp: Date | null;
}

// todo - client can access this type..
export interface ServerAccountCreationCode {
  code: string;
  email: string;
  expiration_timestamp: Date;
  used_timestamp: Date | null;
  deletion_timestamp: Date | null;
}

export interface ServerPermission {
  name: string;
  description: string;
}

export type ServerDatabaseQueryResult<T> =
  | { success: true; result: T }
  | { success: false; errorString: string };
