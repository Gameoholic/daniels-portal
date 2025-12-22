import { NextResponse } from "next/server";
import {
  requestCreateUser,
  requestGetAccountCreationCode,
} from "@/src/utils/db/auth/db_actions";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { ServerDatabaseQueryResult } from "@/src/db/_internal/server_types";

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status

export async function POST(req: Request) {
  // Sanity checks
  if (req === null) {
    return NextResponse.json({ error: "Unknown request" }, { status: 400 });
  }
  const data = await req.json();
  if (data === null || data.accountCreationCode === null) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
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
  } else if (accountCreationCode.used_timestamp != null) {
    return NextResponse.json(
      { error: "Account creation code was already used to create an account." },
      { status: 401 }
    );
  } else if (accountCreationCode.expiration_timestamp < new Date()) {
    return NextResponse.json(
      { error: "Account creation code expired." },
      { status: 401 }
    );
  }

  // Return successful response
  const res = NextResponse.json({ status: 200 });
  return res;
}
