"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ClientDatabaseQueryResult,
  ClientExpense,
} from "@/src/utils/client_types";
import { v4 as uuidv4 } from "uuid";
import Expenses from "@/src/components/book-keeping/Expenses";
import { getExpensesAction } from "@/src/actions/expenses";
import { useEffect, useState } from "react";

// by default, pages are rendered on server. meaning the code is ran on the server,
// then a simpler html with no code is sent to the client.
// a client component/page, will be rendered on client, but can't use server stuff like databases.
// async server component (export default async function Home())

export default function Home() {
  const [expenses, setExpenses] = useState<
    ClientDatabaseQueryResult<ClientExpense[]>
  >({
    success: false,
    errorString: "Failed.",
  });

  useEffect(() => {
    async function loadExpenses() {
      const a = await getExpensesAction();
      setExpenses(a);
    }
    loadExpenses();
  }, []);

  return (
    <div>
      <Expenses expenses={expenses.success ? expenses.result : []} />
    </div>
  );
}
