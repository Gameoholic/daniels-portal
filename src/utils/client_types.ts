export interface ClientExpense {
  id: string;
  title: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: string;
  subscriptionId: string | null;
  reimbursementExpectedAmount: number;
  reimbursementNotes: string;
  reimbursementIncomeIds: string[];
  timestamp: Date;
  lastEditedTimestamp: Date | null;
  lastAccessedTimestamp: Date;
  creationTimestamp: Date;
}

export interface ClientGymWeight {
  amount: number;
  timestamp: Date;
}

export interface ClientUser {
  id: string;
  username: string;
  email: string;
  creationTimestamp: Date;
  defaultTokenExpirySeconds: number;
  maxTokensAtATime: number | null;
  lastLoginTimestamp: Date | null;
}

export interface ClientAccessToken {
  token: string;
  userId: string;
  creationTimestamp: Date;
  expirationTimestamp: Date;
  lastUseTimestamp: Date | null;
}

export type ClientDatabaseQueryResult<T> =
  | { success: true; result: T }
  | { success: false; errorString: string };
