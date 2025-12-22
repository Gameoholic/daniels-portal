import Security from "@/src/components/user-settings/Security";
import { Suspense } from "react";
import { cookies } from "next/headers";
import AdvancedSettings from "@/src/components/user-settings/AdvancedSettings";
import {
  getUserAccessTokensAction,
  getUserAction,
} from "@/src/actions/per-page/user-settings";

// Can issue account creation codes by email. User will be able to delete these codes.
// Can manage and delete all account creation codes, even those issued by other users.
// Can delete and see info (last login date, etc.) of other user accounts as well as manage and revoke their access tokens, although they will be obfuscated.
// Can temporarily block users from logging in. This will hard-block them regardless of validy of access tokens.

// Dashboard
// Account creation codes (create + manage/delete)
// Users

export default function UserSettings() {
  return (
    <section>
      <Suspense
        fallback={
          <AdvancedSettings
            user={null}
            tokenAmount={null}
            loading={true}
            errorString=""
          />
        }
      >
        <UserDataLoader />
      </Suspense>
    </section>
  );
}

async function UserDataLoader() {
  // Avoiding waterfall by running both actions at the same time
  const userActionPromise = getUserAction();
  const userAccessTokensPromise = getUserAccessTokensAction();

  const [userAction, userAccessTokens] = await Promise.all([
    userActionPromise,
    userAccessTokensPromise,
  ]);

  return (
    <AdvancedSettings
      user={userAction.success ? userAction.result : null}
      tokenAmount={
        userAccessTokens.success ? userAccessTokens.result.length : null
      }
      loading={false}
      errorString={userAction.success ? "" : userAction.errorString}
    />
  );
}
