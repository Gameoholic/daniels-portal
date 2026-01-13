import "server-only";

import { DatabaseError, QueryResult } from "pg";
import { cache } from "react";
import { cookies } from "next/headers";
import db from "./db";
import {
  AccessTokenInvalidReason,
  tokenless_getAccessToken,
  isAccessTokenValid,
  tokenless_getUserPermissions,
} from "./_internal/tokenless-queries";
import { ServerAccessToken } from "@/src/db/_internal/per-table/access-tokens";
import {
  getUserPermissions,
  Permission,
} from "@/src/db/_internal/per-table/permissions";

declare const AuthorizedDALScope: unique symbol;
declare const AuthorizedDALTokenlessScope: unique symbol;
/**
 * Prevents use of internal DB functions outside of the dal.ts file. They are designed to be invoked via the executeDatabaseQuery function.
 * All internal functions (that use access tokens) are required to have this scope as a parameter.
 * Only internal files can import this type, thus guaranteeing the scope.
 */
export type DALScope = {
  readonly [AuthorizedDALScope]: true;
};

/**
 * Prevents use of internal DB functions outside of the dal.ts file. They are designed to be invoked via the tokenless_executeDatabaseQuery function.
 * All TOKENLESS internal functions are required to have this scope as a parameter.
 * Only internal files can import this type, thus guaranteeing the scope.
 */
export type DALTokenlessQueryScope = {
  readonly [AuthorizedDALTokenlessScope]: true;
};

export type DatabaseQueryResult<T> =
  | { success: true; result: T }
  | { success: false; errorString: string };

export function databaseQueryError(
  errorString: string
): DatabaseQueryResult<any> {
  return { success: false, errorString: errorString };
}

export function databaseQuerySuccess(): DatabaseQueryResult<void>;
export function databaseQuerySuccess<T>(result: T): DatabaseQueryResult<T>;
export function databaseQuerySuccess<T>(
  result?: T
): DatabaseQueryResult<T | void> {
  return {
    success: true,
    result: result as T,
  };
}

/**
 * Can pass this as a parameter to get the user ID from the passed access token.
 */
export const GET_USER_ID_FROM_ACCESS_TOKEN: unique symbol = Symbol(
  "USE_USER_ID_FROM_ACCESS_TOKEN"
);

function resolveArgs<Args extends readonly unknown[]>(
  args: Args,
  userIdFromToken: string
): Args {
  return args.map((arg) =>
    arg === GET_USER_ID_FROM_ACCESS_TOKEN ? userIdFromToken : arg
  ) as unknown as Args;
}

/**
 * Executes a database query and returns error/success as well as the result if succeeded.
 *
 * Will check validity of the token provided (will check whether it exists in the database and not expired/revoked, nothing further.)
 *
 * Will also update the last used timestamp of the token.
 *
 * ⚠️ IMPORTANT!!! This method DOES NOT:
 * - Check for permissions
 * - Check whether the provided arguments are associated with the provided access token
 * (eg. a user could use their own token to request to update another user's expense, as long as they know the expense ID.
 * The user's own token is valid, therefore we don't return an error.).
 *
 * @param requesterAccessToken The access token of the requester user. If null, will return an invalid token error immediately.
 * @param queryMethod The internal query to call. (any authenticated query function inside db/_internal)
 * @param args The argument to pass to the internal query. Must match the function signature of queryMethod (except for the scope variable, ignore it). Can use the USE_USER_ID_FROM_ACCESS_TOKEN symbol instead of an argument for the user ID of the requester.
 * @returns Failure with error message, or success with the query's result (undefined in case of query return type void).
 */
export async function executeDatabaseQuery<T, Args extends readonly unknown[]>(
  requesterAccessToken: string | null,
  queryMethod: (scope: DALScope, ...args: Args) => Promise<T>,
  args: {
    readonly [K in keyof Args]: Args[K] extends string
      ? string | typeof GET_USER_ID_FROM_ACCESS_TOKEN
      : Args[K];
  },
  mappedErrorCodeMessages: Record<string, string> = {},
  unmappedErrorCodeMessage: string = "An unknown error has occurred.",
  unknownErrorMessage1: string = "An unknown error has occurred.",
  unknownErrorMessage2: string = "An unknown error has occurred."
): Promise<DatabaseQueryResult<T>> {
  try {
    // Check validity of provided access token
    if (!requesterAccessToken) {
      return {
        success: false,
        errorString: "Invalid access token.",
      };
    }
    let accessTokenVerificationResult = await verifyAccessToken(
      requesterAccessToken
    );
    if (!accessTokenVerificationResult.success) {
      return accessTokenVerificationResult;
    }

    // Update the access token last use timestamp
    await updateAccessTokenLastUseTimestamp(
      accessTokenVerificationResult.result.user_id,
      requesterAccessToken
    );

    const resolvedArgs = resolveArgs(
      args,
      accessTokenVerificationResult.result.user_id
    ) as Args;

    // Finally, execute the query
    let result: T = await queryMethod(
      {} as DALScope, // Creates the scope
      ...resolvedArgs
    );

    return { success: true, result: result };
  } catch (error: any) {
    // Identify error type
    let errorMessage: string;
    if (error instanceof DatabaseError && error.code) {
      const mappedMessage: string | null = mappedErrorCodeMessages[error.code];
      errorMessage = mappedMessage ?? unmappedErrorCodeMessage;
      if (!mappedMessage) {
        // This generally shouldn't happen so we log it
        console.error(
          "DB Query unhandled DatabaseError error:",
          error.code,
          error
        );
      }
    } else if (error instanceof Error) {
      // This should never happen
      //console.error("DB Query unknown error:", error.message, error);
      errorMessage = unknownErrorMessage1;
    } else {
      // This should even more, never happen
      //console.error("DB Query unknown error:", error);
      errorMessage = unknownErrorMessage2;
    }
    return { success: false, errorString: errorMessage };
  }
}

/**
 * Executes a database query and returns error/success as well as the result if succeeded.
 *
 * ⚠️ Does not verify an access token before executing.
 *
 * Only designated tokenless queries can be used via this method.
 * Still, do not use this function if we have a user token. Should be limited to the website non-user homepage and middleware.
 *
 * This is designed to be used by server for actions that do not have a user token yet (for example, login or register requests..)
 */
export async function tokenless_executeDatabaseQuery<T, Args extends any[]>(
  queryMethod: (scope: DALTokenlessQueryScope, ...args: Args) => Promise<T>,
  args: Args,
  mappedErrorCodeMessages: Record<string, string> = {},
  unmappedErrorCodeMessage: string = "An unknown error has occurred.",
  unknownErrorMessage1: string = "An unknown error has occurred.",
  unknownErrorMessage2: string = "An unknown error has occurred."
): Promise<DatabaseQueryResult<T>> {
  /// todo: this will be used for databse queries without user token
  // do this for login and register
  // and check if we can use this for middleware or smthn cause right now we just call
  // the function directly and i would prefer not to do that.
  try {
    // Finally, execute the query
    let result: T = await queryMethod(
      {} as DALTokenlessQueryScope, // Creates the scope
      ...args
    );

    return { success: true, result: result };
  } catch (error: any) {
    // Identify error type
    let errorMessage: string;
    if (error instanceof DatabaseError && error.code) {
      const mappedMessage: string | null = mappedErrorCodeMessages[error.code];
      errorMessage = mappedMessage ?? unmappedErrorCodeMessage;
      if (!mappedMessage) {
        // This generally shouldn't happen so we log it
        console.error(
          "DB Query unhandled DatabaseError error:",
          error.code,
          error
        );
      }
    } else if (error instanceof Error) {
      // This should never happen
      //console.error("DB Query unknown error:", error.message, error);
      errorMessage = unknownErrorMessage1;
    } else {
      // This should even more, never happen
      //console.error("DB Query unknown error:", error);
      errorMessage = unknownErrorMessage2;
    }
    return { success: false, errorString: errorMessage };
  }
}

export async function verifyAccessTokenFromBrowser(): Promise<
  DatabaseQueryResult<ServerAccessToken>
> {
  return await verifyAccessToken(await getAccessTokenFromBrowser());
}

export async function getAccessTokenFromBrowser(): Promise<string | null> {
  const token = (await cookies()).get("access-token")?.value;
  return token ?? null;
}

export async function verifyAccessToken(
  token: string | null
): Promise<DatabaseQueryResult<ServerAccessToken>> {
  if (!token) {
    return {
      success: false,
      errorString: "Invalid access token.",
    };
  }

  // THIS WILL VERIFY THE TOKEN IS ACTUALLY VALID and not expired/revoked
  // We use the function directly and not through executeDatabaseQuery because this function is called there!
  const getAccessTokenRequest = await tokenless_executeDatabaseQuery(
    tokenless_getAccessToken,
    [token]
  );
  if (!getAccessTokenRequest.success) {
    return {
      success: false,
      errorString: "Invalid access token.",
    };
  }
  const accessToken = getAccessTokenRequest.result;

  const accessTokenValidationResult = isAccessTokenValid(accessToken);
  if (!accessTokenValidationResult.valid) {
    switch (accessTokenValidationResult.reason) {
      case AccessTokenInvalidReason.EXPIRED:
        return {
          success: false,
          errorString: "Access token has expired. Please log in again.",
        };

      case AccessTokenInvalidReason.MANUALLY_REVOKED:
        return {
          success: false,
          errorString:
            "Access token was revoked due to user action. Please log in again.",
        };

      case AccessTokenInvalidReason.AUTOMATICALLY_REVOKED:
        return {
          success: false,
          errorString:
            "Access token was revoked automatically due to your account's security policy. Please log in again.",
        };

      default:
        return {
          success: false,
          errorString: "Unknown error with access token.",
        };
    }
  }

  return {
    success: true,
    result: accessToken,
  };
}

/**
 * Updates the last_use_timestamp field of an access token to now.
 * Only updates the token if its owner matches the requester user id.
 */
async function updateAccessTokenLastUseTimestamp(
  requesterUserId: string,
  token: string
): Promise<void> {
  try {
    const result = await db.query(
      "UPDATE access_tokens SET last_use_timestamp = $1 WHERE token = $2 AND user_id = $3",
      [new Date(), token, requesterUserId]
    );
    if (result.rowCount == 0) {
      throw Error("Token doesn't exist.");
    }
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns Whether the user (using the access token from the browser) has a certain permission
 */
export async function checkForPermission(
  permission: Permission
): Promise<DatabaseQueryResult<void>> {
  const getUserPermissionsQuery = await executeDatabaseQuery(
    await getAccessTokenFromBrowser(),
    getUserPermissions,
    [GET_USER_ID_FROM_ACCESS_TOKEN]
  );
  if (!getUserPermissionsQuery.success) {
    return databaseQueryError("An error has occurred.");
  }
  if (!getUserPermissionsQuery.result.find((x) => x.permission == permission)) {
    return databaseQueryError("No permission.");
  }

  return databaseQuerySuccess();
}

// todo: this method can be optimized by calling the getUserPermissions query just once instead of once per permission
/**
 *
 * @returns Whether the user (using the access token from the browser) has all the specified permissions
 */
export async function checkForPermissions(
  ...permissionNames: Permission[]
): Promise<DatabaseQueryResult<void>> {
  for (const permission of permissionNames) {
    if (!(await checkForPermission(permission)).success) {
      return databaseQueryError("No permission.");
    }
  }

  return databaseQuerySuccess();
}
