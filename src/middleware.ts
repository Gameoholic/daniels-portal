export const runtime = "nodejs"; // https://nextjs.org/docs/app/api-reference/edge

// Always prefer using server components over client components because they send 0 javascript to the client

import { NextRequest, NextResponse } from "next/server";
import {
  DatabaseQueryResult,
  tokenless_executeDatabaseQuery,
  verifyAccessToken,
  verifyAccessTokenFromBrowser,
} from "./db/dal";
import { tokenless_getUserPermissions } from "./db/_internal/tokenless-queries";
import {
  Permission,
  ServerPermission,
} from "@/src/db/_internal/per-table/permissions";
import { forbidden } from "next/navigation";

// todo: clean up this entire logic
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("access-token")?.value;
  const verifyAccessTokenResult = await verifyAccessToken(token ?? null);
  // also update last token use timestamp

  // Special case, redirect to home if already logged in:
  if (
    // todo this check shouldn't be separate to the one below with the error codes, should be centralized
    path === "/" &&
    verifyAccessTokenResult.success
  ) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // PUBLIC PATHS Allow public paths regardless of whether logged in or not
  const publicPaths = [
    "/",
    "/api/login",
    "/api/create-account",
    "/api/verify-account-creation-code",
    "/favicon.ico",
  ];

  if (publicPaths.includes(path) || path.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // PRIVATE PATHS and semi-private paths only allow if user logs in or has permissions

  // Verify access token exists
  if (!token) {
    return NextResponse.json(
      { error: "You must log in to access this page." },
      { status: 401 }
    );
  }
  // Verify token validity
  if (!verifyAccessTokenResult.success) {
    return NextResponse.json(
      { error: verifyAccessTokenResult.errorString }, // todo: should error strings be public to users? we should have a table that converts private error strings to public ones, changable in config. across entire wbesite
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
  const userId = verifyAccessTokenResult.result.user_id;
  // We do this via the without-token method and not an action because the executeDatabaseQuery method takes the token from the cookie directly.
  const getUserPermissionsRequest = await tokenless_executeDatabaseQuery(
    tokenless_getUserPermissions,
    [userId]
  );
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
      (permission) => permission.permission === Permission.UseApp_Admin
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/book-keeping" || path.startsWith("/book-keeping/")) &&
    userPermissions.some(
      (permission) => permission.permission === Permission.UseApp_BookKeeping
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/gym" || path.startsWith("/gym/")) &&
    userPermissions.some(
      (permission) => permission.permission === Permission.UseApp_Gym
    )
  ) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: "Page does not exist." }, { status: 401 });
}
