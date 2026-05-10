import { Barlow_Condensed, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import s from "./page.module.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--barlow-condensed",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--space-grotesk",
  display: "swap",
});

const ERROR_MESSAGES: Record<string, string> = {
  not_found:
    "No account found for that Google address. Contact your admin to get access.",
  unauthorized: "Your account doesn't have CRM access. Contact your admin.",
  invalid_state: "Login session expired. Please try again.",
  token_exchange: "Authentication failed. Please try again.",
  profile: "Couldn't retrieve your Google profile. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.")
    : null;

  return (
    <div
      className={`${s.page} ${barlowCondensed.variable} ${spaceGrotesk.variable}`}
    >
      <div className={s.ambient} aria-hidden="true" />

      <div className={s.card}>
        <Link href="/" className={s.logo}>
          TRAINER<span className={s.logoDot}>.</span>
        </Link>

        <div>
          <h1 className={s.heading}>WELCOME BACK</h1>
          <p className={s.sub}>Sign in to your trainer account</p>
        </div>

        {errorMessage && <div className={s.error}>{errorMessage}</div>}

        <div className={s.divider} />

        <a href="/api/auth/google" className={s.googleBtn}>
          <FcGoogle size={18} aria-hidden="true" />
          Continue with Google
        </a>

        <p className={s.footer}>
          Access is by invitation only. Contact your admin if you need help.
        </p>
      </div>
    </div>
  );
}

