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
  deleteAccessToken,
} from "@/src/utils/db/auth/db_queries";
import { executeDatabaseQuery } from "@/src/utils/db/db";

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestGetUserByUsername(
  username: string
): Promise<ServerDatabaseQueryResult<ServerUser>> {
  return await executeDatabaseQuery(() => getUserByUsername(username), {});
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestGetUserById(
  id: string
): Promise<ServerDatabaseQueryResult<ServerUser>> {
  return await executeDatabaseQuery(() => getUserById(id), {});
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestCreateAccessToken(
  token: string,
  userId: string,
  expirationTimestamp: Date
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() =>
    createAccessToken(token, userId, expirationTimestamp, null)
  );
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestDeleteAccessToken(
  token: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => deleteAccessToken(token));
}
// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestGetAccountCreationCode(
  code: string
): Promise<ServerDatabaseQueryResult<ServerAccountCreationCode>> {
  return await executeDatabaseQuery(() => getAccountCreationCode(code));
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestGetAccessToken(
  token: string
): Promise<ServerDatabaseQueryResult<ServerAccessToken>> {
  return await executeDatabaseQuery(() => getAccessToken(token));
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestCreateUser(
  user: ServerUser
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => createUser(user));
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestSetAccountCreationCodeUsed(
  code: string
): Promise<ServerDatabaseQueryResult<void>> {
  return await executeDatabaseQuery(() => setAccountCreationCodeUsed(code));
}

// CONTAINS HASHED PASSWORD AND OTHER SENSITIVE INFO - NEVER EXPOSE TO CLIENT!
export async function requestGetUserPermissions(
  userId: string
): Promise<ServerDatabaseQueryResult<ServerPermission[]>> {
  return await executeDatabaseQuery(() => getUserPermissions(userId));
}
