"use client";

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { ThemeSwitcher } from "@/src/components/global/ThemeSwitcher";
import { verifyAccountCreationCodeAction } from "../actions/verify-account-creation-code";
import { createAccountAction } from "../actions/create-account";
import { loginAction } from "@/src/actions/login";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 justify-center text-center p-6">
      <p className="font-semibold text-4xl">Welcome.</p>
      <div className="flex flex-col gap-8 items-center">
        <div className="flex flex-col gap-3">
          <LoginButton />
          <CreateAccountButton />
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}

function CreateAccountButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-35">
          Create account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <CreateAccountCodeForm />
      </DialogContent>
    </Dialog>
  );
}

function CreateAccountCodeForm() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCodeCorrect, setIsCodeCorrect] = useState(false);

  async function handleSubmit(code: string) {
    setLoading(true);

    const verifyAccountCreationCodeActionResult =
      await verifyAccountCreationCodeAction(code);

    setLoading(false);

    if (!verifyAccountCreationCodeActionResult.success) {
      setIsCodeCorrect(false);
      setValue("");

      toast("Failed to create account", {
        description: verifyAccountCreationCodeActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      setIsCodeCorrect(true);
      toast("Code processed successfully", {
        description: "You may now create an account.",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
  }

  if (isCodeCorrect) {
    return <CreateAccountForm accountCreationCode={value} />;
  }
  return (
    <DialogHeader>
      <DialogTitle>Enter your one-time account creation code.</DialogTitle>
      <DialogDescription>
        This will allow you to create a single account.
        <div className="flex justify-center mt-4">
          <InputOTP
            disabled={loading}
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              if (newValue.length === 6) handleSubmit(newValue);
            }}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
      </DialogDescription>
    </DialogHeader>
  );
}

function LoginButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-35">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <LoginForm />
      </DialogContent>
    </Dialog>
  );
}
function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    toast("Logging in...", {
      duration: 5000,
    });

    const loginActionResult = await loginAction(username, password);

    setLoading(false);

    if (!loginActionResult.success) {
      toast("Failed to log in", {
        description: loginActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      await cookieStore.set(
        "access-token",
        loginActionResult.result.accessToken
      );
      router.push("/home");
      toast("Logged in", {
        description: "Redirecting to home...",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="mb-3">
        <DialogTitle>Log in to your account</DialogTitle>
        <DialogDescription>Use your login credentials.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="username-1">Username</Label>
          <Input
            id="username-1"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={true}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password-1">Password</Label>
          <Input
            id="password-1"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={true}
          />
        </div>
      </div>
      <DialogFooter className="mt-4 items-center flex">
        {loading && <Spinner className={`mr-2 w-5 h-5`} />}
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          Log in
        </Button>
      </DialogFooter>
    </form>
  );
}

function CreateAccountForm({
  accountCreationCode,
}: {
  accountCreationCode: string;
}) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    toast("Creating account...", {
      duration: 5000,
    });

    const createAccountActionResult = await createAccountAction(
      username,
      password,
      email,
      accountCreationCode
    );

    setLoading(false);

    if (!createAccountActionResult.success) {
      toast("Failed to create account", {
        description: createAccountActionResult.errorString,
        icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
        duration: 3000,
      });
    } else {
      toast("Successfully created account", {
        description: "Logging in...",
        icon: <CheckCircle2Icon className="text-success-foreground w-5 h-5" />,
        duration: 3000,
      });
      setLoading(true);

      const loginActionResult = await loginAction(username, password);

      setLoading(false);
      if (!loginActionResult.success) {
        toast("Failed to log in", {
          description: loginActionResult.errorString || "Unknown error.",
          icon: <AlertCircleIcon className="text-error-foreground w-5 h-5" />,
          duration: 3000,
        });
      } else {
        await cookieStore.set(
          "access-token",
          loginActionResult.result.accessToken
        );
        router.push("/home");
        toast("Logged in", {
          description: "Redirecting to home...",
          icon: (
            <CheckCircle2Icon className="text-success-foreground w-5 h-5" />
          ),
          duration: 3000,
        });
      }
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="mb-3">
        <DialogTitle>Create your account</DialogTitle>
        <DialogDescription>
          An email will be sent for verification. Note you can only use the
          email address associated with the one-time code.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-3">
          <Label htmlFor="username-1">Username</Label>
          <Input
            id="username-1"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required={true}
          />
          <Label htmlFor="email-1">Email</Label>
          <Input
            id="email-1"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={true}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password-1">Password</Label>
          <Input
            id="password-1"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={true}
          />
        </div>
      </div>
      <DialogFooter className="mt-4 items-center flex">
        {loading && <Spinner className={`mr-2 w-5 h-5`} />}
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          Create account
        </Button>
      </DialogFooter>
    </form>
  );
}
