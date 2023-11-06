import { type Params, useMatches } from "@remix-run/react";
import dayjs, { type Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { type User } from "~/models/user.server";

import "dayjs/locale/fr";

dayjs.extend(weekday);
dayjs.locale("fr");

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string,
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  );
  return route?.data as Record<string, unknown>;
}

function isUser(user: unknown): user is User {
  return (
    user != null &&
    typeof user === "object" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root");
  if (!data || !isUser(data.user)) {
    return undefined;
  }
  return data.user;
}

export function useUser(): User {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    );
  }
  return maybeUser;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function pluralize(
  word: string | [string, string],
  count: number | unknown[],
  suffix = "s",
): string {
  const total = Array.isArray(count) ? count.length : count;

  if (Array.isArray(word)) {
    return total > 1 ? word[1] : word[0];
  }

  return total > 1 ? word + suffix : word;
}

export function genderize(
  word: string | [string, string],
  gender: string,
  feminine = `${word}e`,
) {
  if (gender === "female") {
    return feminine;
  }

  return word;
}

export function notNullable<T>(item: T): item is NonNullable<T> {
  return !!item;
}

export function getYearParam(params: Params): number {
  invariant(params.year, `Year is required`);
  const year = Number(params.year);
  invariant(Number.isInteger(year), "Year must be a integer");

  return year;
}

export function getCurrentYear() {
  return dayjs().subtract(1, "month").year();
}

export function getFirstAdventSundayDate(year: number) {
  const christmas = dayjs(`${year}-12-25`);
  return christmas.weekday(-22);
}

export function formatDate(date: Dayjs) {
  if (date.date() === 1) {
    return date.format("1er MMMM");
  }

  return date.format("D MMMM");
}

export function trimPath(path: string) {
  if (path[0] === "/") {
    return path.substring(1);
  }

  return path;
}

export function toAbsoluteUrl(path: string) {
  const baseUrl =
    typeof process !== "undefined" && process.env.BASE_URL
      ? process.env.BASE_URL
      : "http://localhost:1234";

  return `${baseUrl}/${trimPath(path)}`;
}