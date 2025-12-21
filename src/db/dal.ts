import "server-only";

import { DatabaseError, QueryResult } from "pg";
import {
  AccessTokenInvalidReason,
  isAccessTokenValid,
  ServerDatabaseQueryResult,
  ServerUser,
} from "../utils/server_types";
import { ClientDatabaseQueryResult } from "@/src/utils/client_types";
import { ServerAccessToken, ServerExpense } from "@/src/utils/server_types";
import {
  requestGetAccessToken,
  requestUpdateAccessTokenLastUseTimestamp,
} from "@/src/utils/db/auth/db_actions";
import { cache } from "react";
import { cookies } from "next/headers";
import db from "../utils/db/db";

declare const AuthorizedDALScope: unique symbol;
/**
 * Prevents use of internal DB functions outside of the dal.ts executeDatabaseQuery function
 */
export type SecureDBScope = {
  readonly [AuthorizedDALScope]: true;
};

/**
 * Executes a database query and returns error/success as well as the result if succeeded.
 * WILL check validity of the token provided (will check whether it exists in the database and not expired/revoked, nothing further.)
 *
 * IMPORTANT!!! This method DOES NOT:
 * - Check for permissions
 * - Check whether the provided token matches the request parameters (eg. a user could use their own token to request to update another user's expense, as long as they know the expense ID. The user's own token is valid, therefore we don't return an error.).
 */
export async function executeDatabaseQuery<T, Args extends any[]>(
  requesterAccessToken: string | null,
  queryMethod: (
    scope: SecureDBScope,
    requesterUserId: string,
    ...args: Args
  ) => Promise<T>,
  args: Args,
  mappedErrorCodeMessages: Record<string, string> = {},
  unmappedErrorCodeMessage: string = "An unknown error has occurred.",
  unknownErrorMessage1: string = "An unknown error has occurred.",
  unknownErrorMessage2: string = "An unknown error has occurred."
): Promise<ServerDatabaseQueryResult<T>> {
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

    // Finally, execute the query
    let result: T = await queryMethod(
      {} as SecureDBScope, // Creates the scope
      accessTokenVerificationResult.result.user_id,
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
      console.error("DB Query unknown error:", error.message, error);
      errorMessage = unknownErrorMessage1;
    } else {
      // This should even more, never happen
      console.error("DB Query unknown error:", error);
      errorMessage = unknownErrorMessage2;
    }
    return { success: false, errorString: errorMessage };
  }
}

export async function verifyAccessTokenFromBrowser(): Promise<
  ClientDatabaseQueryResult<ServerAccessToken>
> {
  return await verifyAccessToken(await getAccessTokenFromBrowser());
}

export async function getAccessTokenFromBrowser(): Promise<string | null> {
  const token = (await cookies()).get("access-token")?.value;
  return token ?? null;
}

export async function verifyAccessToken(
  token: string | null
): Promise<ClientDatabaseQueryResult<ServerAccessToken>> {
  if (!token) {
    return {
      success: false,
      errorString: "Invalid access token.",
    };
  }

  // THIS WILL VERIFY THE TOKEN IS ACTUALLY VALID and not expired/revoked
  const accessTokenRequest = await requestGetAccessToken(token);
  if (!accessTokenRequest.success) {
    return accessTokenRequest;
  }
  const accessToken = accessTokenRequest.result;
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

  return accessTokenRequest;
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
