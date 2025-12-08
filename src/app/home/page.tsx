import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getExpensesAction } from "@/src/actions/expenses";
import { Suspense } from "react";
import { CircleQuestionMark } from "lucide-react"; // https://lucide.dev/icons/
import { getUserAction } from "@/src/actions/user-actions";
import { ClientUser } from "@/src/utils/client_types";
import HomeWelcome from "@/src/components/home/Home";

// Can issue account creation codes by email. User will be able to delete these codes.
// Can manage and delete all account creation codes, even those issued by other users.
// Can delete and see info (last login date, etc.) of other user accounts as well as manage and revoke their access tokens, although they will be obfuscated.
// Can temporarily block users from logging in. This will hard-block them regardless of validy of access tokens.

// Dashboard
// Account creation codes (create + manage/delete)
// Users

// by default, pages are rendered on server. meaning the code is ran on the server,
// then a simpler html with no code is sent to the client.
// a client component/page, will be rendered on client, but can't use server stuff like databases.
// async server component (export default async function Home())

export default function Home() {
  return (
    <section>
      <Suspense
        fallback={<HomeWelcome user={null} loading={true} errorString="" />}
      >
        <UserDataLoader />
      </Suspense>
    </section>
  );
}

// TODO: to get the second data (tokens) and avoid waterfall:
// https://www.youtube.com/watch?v=6G8tebMv3Yk
export async function UserDataLoader() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const userAction = await getUserAction();
  return (
    <HomeWelcome
      user={userAction.success ? userAction.result : null}
      loading={false}
      errorString={userAction.success ? "" : userAction.errorString}
    />
  );
}
