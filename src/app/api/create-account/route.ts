import { NextResponse } from "next/server";

import {
  requestCreateUser,
  requestGetAccountCreationCode,
  requestGetUserByUsername,
  requestSetAccountCreationCodeUsed,
} from "@/src/utils/db/auth/db_actions";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { ServerDatabaseQueryResult } from "@/src/utils/server_types";

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

export async function POST(req: Request) {
  // Sanity checks
  if (req === null) {
    return NextResponse.json({ error: "Unknown request" }, { status: 400 });
  }
  const data = await req.json();
  if (
    data === null ||
    data.username === null ||
    data.password === null ||
    data.email === null ||
    data.accountCreationCode === null
  ) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const username: string = data.username;
  const plaintextPassword: string = data.password;
  const email: string = data.email;
  const accountCreationCodeString: string = data.accountCreationCode;

  // Check if account creation code is valid
  const getAccountCreationCodeRequest = await requestGetAccountCreationCode(
    accountCreationCodeString
  );
  if (!getAccountCreationCodeRequest.success) {
    return NextResponse.json(
      { error: "Invalid account creation code." },
      { status: 401 }
    );
  }
  const accountCreationCode = getAccountCreationCodeRequest.result;
  if (accountCreationCode.deletion_timestamp) {
    return NextResponse.json(
      { error: "Invalid account creation code." },
      { status: 401 }
    );
  }
  if (accountCreationCode.used_timestamp != null) {
    return NextResponse.json(
      { error: "Account creation code was already used to create an account." },
      { status: 401 }
    );
  }
  if (accountCreationCode.expiration_timestamp < new Date()) {
    return NextResponse.json(
      { error: "Account creation code expired." },
      { status: 401 }
    );
  }
  if (accountCreationCode.email != email) {
    return NextResponse.json(
      { error: "Email does not belong to the email the code was issued to." },
      { status: 401 }
    );
  }
  // TODO
  // While it's impossible to tell if a username exists in the DB upon login, if you have an account creation code you can suss out users, even if
  // we remove the error code (since it'll just fail internally and return a status 500..)
  // Super minor security hole, but still would be nice to maybe fix one day. A fix would be to :
  // - Limit account creation code usage attempts (you've tried to create too many accounts with this code, please contact an administrator) <- More convenient but less secure
  // - To not let users select their own usernames (username would be created along with account creation code) <- Most secure but less convenient
  if ((await requestGetUserByUsername(username)).success) {
    return NextResponse.json(
      { error: "Username already exists." },
      { status: 401 }
    );
  }
  // We deliberately don't check if user with this email already exists. This shouldn't happen because when we issue account creation codes we check for this
  // and if it for some reason it does happen we don't want to expose which emails exist on the DB to the client, so it'll just fall on the 500 status error below.

  // Gen salt & hash password
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT_ROUNDS));
  const hashedPassword = await bcrypt.hash(plaintextPassword, salt);

  // Invalidate account creation code
  const setAccountCreationCodeUsedRequest =
    await requestSetAccountCreationCodeUsed(accountCreationCode.code);
  if (!setAccountCreationCodeUsedRequest.success) {
    return NextResponse.json(
      { error: "Could not create account due to an internal error." },
      { status: 500 }
    );
  }

  // Create account
  const createUserRequest = await requestCreateUser({
    id: uuidv4(),
    username: username,
    email: email,
    hashed_password: hashedPassword,
    creation_timestamp: new Date(),
    last_login_timestamp: null,
    deletion_timestamp: null,
  });

  if (!createUserRequest.success) {
    return NextResponse.json(
      { error: "Could not create account due to an internal error." },
      { status: 500 }
    );
    // Todo: if this happens, revalidate the account creation code
  }

  // Return successful response
  const res = NextResponse.json({ status: 200 });
  return res;
}
