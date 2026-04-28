import { Barlow_Condensed, Space_Grotesk } from "next/font/google";
import Link from "next/link";
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
  unauthorized:
    "Your account doesn't have CRM access. Contact your admin.",
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
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.") : null;

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
          <GoogleIcon />
          Continue with Google
        </a>

        <p className={s.footer}>
          Access is by invitation only. Contact your admin if you need help.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
