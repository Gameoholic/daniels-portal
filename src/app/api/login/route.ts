import { NextResponse } from "next/server";
import {
  requestCreateAccessToken,
  requestGetUserByUsername,
  requestUpdateUserLastLoginTimestamp,
} from "@/src/utils/db/auth/db_actions";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  ServerDatabaseQueryResult,
  ServerUser,
} from "@/src/utils/server_types";

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

export async function POST(req: Request) {
  // Sanity checks
  if (req === null) {
    return NextResponse.json({ error: "Unknown request" }, { status: 400 });
  }
  const data = await req.json();
  if (data === null || data.username === null || data.password === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const username: string = data.username;
  const providedPlaintextPassword: string = data.password;

  // Get user, check if exists
  const getUserRequest: ServerDatabaseQueryResult<ServerUser> =
    await requestGetUserByUsername(username);
  // If get user request failed, likely because username is incorrect:
  if (!getUserRequest.success) {
    const saltJustForShow = await bcrypt.genSalt(
      Number(process.env.BCRYPT_SALT_ROUNDS)
    );
    await bcrypt.hash(providedPlaintextPassword, saltJustForShow);
    // Instead of returning early, we spend time hashing the password the user provided, so it seems as if the account exists. This is to prevent
    // timing attacks where attackers can guess that the username doesn't exist because we returned early without hashing and it took significantly
    // less time to process the request.
    return NextResponse.json(
      { error: "Invalid login credentials." },
      { status: 401 }
    );
  }

  // Check if password matches
  const user: ServerUser = getUserRequest.result;
  if (
    !(await bcrypt.compare(providedPlaintextPassword, user.hashed_password))
  ) {
    // salt is already included in the DB hash field as a prefix, this function does everything we need
    return NextResponse.json(
      { error: "Invalid login credentials." },
      { status: 401 }
    );
  }

  // Generate token
  const token: string = crypto.randomBytes(64).toString("base64url");
  const DaysInMilliseconds = 1000 * 60 * 60 * 24;
  const ExpiryTimestamp: number = Date.now() + DaysInMilliseconds * 7;
  const createAccessTokenRequest = await requestCreateAccessToken(
    token,
    user.id,
    new Date(ExpiryTimestamp)
  );
  if (!createAccessTokenRequest.success) {
    return NextResponse.json(
      { error: "Could not generate access token." },
      { status: 500 }
    );
  }

  // Update last access timestamp
  const updateUserLastLoginTimestampRequest = await requestUpdateUserLastLoginTimestamp(user.id);
  if (!updateUserLastLoginTimestampRequest.success) {
    return NextResponse.json(
      { error: "Could not generate access token." },
      { status: 500 }
    );
    // Todo: if this happens, delete the token
  }

  // Return successful response
  const res = NextResponse.json({ status: 200 });
  res.cookies.set("access-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res;

  // // Create JSON Web Token https://www.jwt.io/ https://www.jwt.io/introduction#what-is-json-web-token
  // const accessToken = await new SignJWT({ "user-id": userId })
  //   .setProtectedHeader({ alg: "HS256" })
  //   .setExpirationTime("5 minutes")
  //   .sign(JWT_SECRET);
}
