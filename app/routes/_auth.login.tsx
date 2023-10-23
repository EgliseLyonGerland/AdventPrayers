import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { Variants, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/");
  const remember = formData.get("remember");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  return createUserSession({
    redirectTo,
    remember: remember === "on" ? true : false,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 1000,
  },
  show: {
    opacity: 1,
    y: 0,

    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/notes";
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      className="flex flex-1 items-center justify-center gap-4 text-base-content"
      method="post"
    >
      <motion.div
        animate="show"
        className="mx-auto w-full max-w-md space-y-8 rounded-xl border border-base-content/10 bg-base-200 p-8 px-12 shadow-xl"
        initial="hidden"
        variants={containerVariants}
      >
        <motion.div className="flex flex-col gap-2" variants={itemVariants}>
          <label htmlFor="email">Email address</label>
          <div>
            <input
              aria-describedby="email-error"
              aria-invalid={actionData?.errors?.email ? true : undefined}
              autoComplete="email"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              className="input w-full rounded border border-gray-500 px-2 py-1 text-lg"
              id="email"
              name="email"
              ref={emailRef}
              required
              type="email"
            />
            {actionData?.errors?.email ? (
              <div className="pt-1 text-red-700" id="email-error">
                {actionData.errors.email}
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div className="flex flex-col gap-2" variants={itemVariants}>
          <label htmlFor="password">Password</label>
          <div>
            <input
              aria-describedby="password-error"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              autoComplete="current-password"
              className="input w-full rounded border border-gray-500 px-2 py-1 text-lg"
              id="password"
              name="password"
              ref={passwordRef}
              type="password"
            />
            {actionData?.errors?.password ? (
              <div className="pt-1 text-red-700" id="password-error">
                {actionData.errors.password}
              </div>
            ) : null}
          </div>
        </motion.div>

        <input name="redirectTo" type="hidden" value={redirectTo} />
        <motion.button
          className="btn btn-secondary btn-outline w-full rounded px-4 py-2"
          type="submit"
          variants={itemVariants}
        >
          Sign in
        </motion.button>
        <motion.div
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center">
            <input
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              id="remember"
              name="remember"
              type="checkbox"
            />
            <label className="ml-2 block text-sm" htmlFor="remember">
              Remember me
            </label>
          </div>
        </motion.div>
      </motion.div>
    </Form>
  );
}
