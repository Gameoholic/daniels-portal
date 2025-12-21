import "server-only";

import { DatabaseError } from "pg";
import {
  ServerUser,
  ServerDatabaseQueryResult,
  ServerAccountCreationCode,
  ServerAccessToken,
  ServerPermission,
} from "@/src/utils/server_types";
import {
  createAccessToken,
  getUserByUsername,
  getUserById,
  createUser,
  getAccountCreationCode,
  setAccountCreationCodeUsed,
  getAccessToken,
  getUserPermissions,
  updateAccessTokenManuallyRevokedTimestamp as updateAccessTokenManuallyRevokedTimestamp,
  updateUserLastLoginTimestamp,
  getUserAccessTokens,
  updateAccessTokenLastUseTimestamp,
  updateDefaultTokenExpiry,
  updateMaxTokensAtATime,
  updateAccessTokenAutomaticallyRevokedTimestamp,
  getAllUsers,
} from "@/src/utils/db/auth/db_queries";
import { executeDatabaseQuery } from "@/src/utils/db/db";

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetUserByUsername(
  username: string
): Promise<ServerDatabaseQueryResult<ServerUser>> {
  return await executeDatabaseQuery(() => getUserByUsername(username), {});
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetAllUsers(): Promise<
  ServerDatabaseQueryResult<ServerUser[]>
> {
  return await executeDatabaseQuery(() => getAllUsers(), {});
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetUserById(
  id: string
): Promise<ServerDatabaseQueryResult<ServerUser>> {
  return await executeDatabaseQuery(() => getUserById(id), {});
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestCreateAccessToken(
  token: string,
  userId: string,
  expirationTimestamp: Date
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    createAccessToken(token, userId, expirationTimestamp, null, new Date())
  );
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestUpdateAccessTokenManuallyRevokedTimestamp(
  token: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    updateAccessTokenManuallyRevokedTimestamp(token)
  );
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestUpdateAccessTokenAutomaticallyRevokedTimestamp(
  token: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    updateAccessTokenAutomaticallyRevokedTimestamp(token)
  );
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetAccountCreationCode(
  code: string
): Promise<ServerDatabaseQueryResult<ServerAccountCreationCode>> {
  return await executeDatabaseQuery(() => getAccountCreationCode(code));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetAccessToken(
  token: string
): Promise<ServerDatabaseQueryResult<ServerAccessToken>> {
  return await executeDatabaseQuery(() => getAccessToken(token));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestCreateUser(
  user: ServerUser
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => createUser(user));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestUpdateUserLastLoginTimestamp(
  userId: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => updateUserLastLoginTimestamp(userId));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestUpdateAccessTokenLastUseTimestamp(
  token: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    updateAccessTokenLastUseTimestamp(token)
  );
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestSetAccountCreationCodeUsed(
  code: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => setAccountCreationCodeUsed(code));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetUserPermissions(
  userId: string
): Promise<ServerDatabaseQueryResult<ServerPermission[]>> {
  return await executeDatabaseQuery(() => getUserPermissions(userId));
}

// RETURNS SERVER TYPE WITH FULL DATA THAT CLIENT SHOULDN'T NECESSARILY KNOW ABOUT - NEVER EXPOSE TO CLIENT!
export async function requestGetUserAccessTokens(
  userId: string
): Promise<ServerDatabaseQueryResult<ServerAccessToken[]>> {
  return await executeDatabaseQuery(() => getUserAccessTokens(userId));
}

export async function requestUpdateDefaultTokenExpiry(
  userId: string,
  expirySeconds: number
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    updateDefaultTokenExpiry(userId, expirySeconds)
  );
}

export async function requestUpdateMaxTokensAtATime(
  userId: string,
  max: number | null
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => updateMaxTokensAtATime(userId, max));
}
