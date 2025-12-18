export const runtime = "nodejs"; // https://nextjs.org/docs/app/api-reference/edge

// Always prefer using server components over client components because they send 0 javascript to the client

import { NextRequest, NextResponse } from "next/server";
import {
  requestGetAccessToken,
  requestGetUserPermissions,
} from "./utils/db/auth/db_actions";
import {
  ServerAccessToken,
  ServerDatabaseQueryResult,
  ServerPermission,
} from "./utils/server_types";
import { getAndVerifyAccessToken } from "./actions/auth";

// todo: clean up this entire logic
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("access-token")?.value;
  const getAccessTokenRequest: ServerDatabaseQueryResult<ServerAccessToken> | null =
    token == null ? null : await getAndVerifyAccessToken();

  // PUBLIC PATHS Allow public paths regardless of whether logged in or not
  const publicPaths = [
    "/",
    "/api/login",
    "/api/create-account",
    "/api/verify-account-creation-code",
    "/favicon.ico",
  ];

  // Special case, redirect to home if already logged in:
  if (
    // todo this check shouldn't be separate to the one below with the error codes, should be centralized
    path === "/" &&
    getAccessTokenRequest &&
    getAccessTokenRequest.success &&
    getAccessTokenRequest.result.expiration_timestamp > new Date()
  ) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  if (publicPaths.includes(path) || path.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // PRIVATE PATHS and semi-private paths only allow if user logs in or has permissions

  // Verify access token exists
  if (!token || !getAccessTokenRequest) {
    return NextResponse.json(
      { error: "You must log in to access this page." },
      { status: 401 }
    );
  }
  // Verify token validity
  if (!getAccessTokenRequest.success) {
    return NextResponse.json(
      { error: "Invalid access token." },
      { status: 401 }
    );
  }
  const accessToken = getAccessTokenRequest.result;
  if (accessToken.expiration_timestamp < new Date()) {
    return NextResponse.json(
      { error: "Access token expired. Please log in again." },
      { status: 401 }
    );
  }

  // SEMI-PRIVATE PATHS only allow if user is logged in, regardless of permission
  if (path === "/home") {
    return NextResponse.next();
  }
  if (path.startsWith("/user-settings")) {
    return NextResponse.next();
  }
  if (path === "/settings") {
    return NextResponse.next();
  }

  // PRIVATE PATHS only allow if has permission
  // Verify permissions:
  const userId = getAccessTokenRequest.result.user_id;
  const getUserPermissionsRequest = await requestGetUserPermissions(userId);
  if (!getUserPermissionsRequest.success) {
    return NextResponse.json(
      { error: "Failed due to an internal error." },
      { status: 500 }
    );
  }
  const userPermissions: ServerPermission[] = getUserPermissionsRequest.result;

  if (
    (path === "/admin" || path.startsWith("/admin")) &&
    userPermissions.some(
      (permission) => permission.permission_name === "use_app_admin"
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/book-keeping" || path.startsWith("/book-keeping/")) &&
    userPermissions.some(
      (permission) => permission.permission_name === "use_app_book_keeping"
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/gym" || path.startsWith("/gym/")) &&
    userPermissions.some(
      (permission) => permission.permission_name === "use_app_gym"
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/car" || path.startsWith("/car/")) &&
    userPermissions.some(
      (permission) => permission.permission_name === "use_app_car"
    )
  ) {
    return NextResponse.next();
  }
  return NextResponse.json({ error: "Page does not exist." }, { status: 401 });
}
