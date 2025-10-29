export const runtime = "nodejs"; // https://nextjs.org/docs/app/api-reference/edge

import { NextRequest, NextResponse } from "next/server";
import {
  requestGetAccessToken,
  requestGetUserPermissions,
} from "./utils/db/auth/db_actions";
import { ServerPermission } from "./utils/server_types";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  // Allow public paths regardless of whether logged in or not
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

  // PRIVATE PATHS: ----

  // Verify access token exists
  const token = req.cookies.get("access-token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "You must log in to access this page." },
      { status: 401 }
    );
  }
  // Verify token validity
  const getAccessTokenRequest = await requestGetAccessToken(token);
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

  // TODO update access token last use timestamp in db

  if (path === "/home") {
    return NextResponse.next();
  }

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
    userPermissions.some((permission) => permission.name === "use_app_admin")
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/book-keeping" || path.startsWith("/book-keeping/")) &&
    userPermissions.some(
      (permission) => permission.name === "use_app_book_keeping"
    )
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/gym" || path.startsWith("/gym/")) &&
    userPermissions.some((permission) => permission.name === "gym")
  ) {
    return NextResponse.next();
  }

  if (
    (path === "/car" || path.startsWith("/car/")) &&
    userPermissions.some((permission) => permission.name === "car")
  ) {
    return NextResponse.next();
  }
  return NextResponse.json({ error: "Page does not exist." }, { status: 401 });
}
