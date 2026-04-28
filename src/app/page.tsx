"use client";

import { Barlow_Condensed, Space_Grotesk, Space_Mono } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { CiCircleCheck } from "react-icons/ci";
import s from "./page.module.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--barlow-condensed",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--space-grotesk",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--space-mono",
  display: "swap",
});

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      className={`${s.page} ${barlowCondensed.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <div className={s.ambient} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={s.nav}>
        <div className={s.navInner}>
          <Link href="/" className={s.navLogo}>
            TRAINER<span className={s.dot}>.</span>
          </Link>
          <ul className={s.navLinks}>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#progress">Progress</a>
            </li>
            <li>
              <a href="#clients">For Clients</a>
            </li>
          </ul>
          <div className={s.navRight}>
            <button
              className={s.navMobileToggle}
              aria-label="Menu"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect y="2" width="18" height="2" rx="1" fill="currentColor" />
                <rect y="8" width="18" height="2" rx="1" fill="currentColor" />
                <rect y="14" width="18" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
            <Link href="/dashboard" className={s.btnGhost}>
              Sign In
            </Link>
            <Link href="/dashboard" className={s.btnPrimary}>
              Get Started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
        {mobileNavOpen && (
          <div className={s.mobileMenu}>
            <a href="#features" onClick={() => setMobileNavOpen(false)}>
              Features
            </a>
            <a href="#progress" onClick={() => setMobileNavOpen(false)}>
              Progress
            </a>
            <a href="#clients" onClick={() => setMobileNavOpen(false)}>
              For Clients
            </a>
            <Link href="/dashboard" onClick={() => setMobileNavOpen(false)}>
              Sign In
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className={s.section}>
        <div className={s.hero}>
          <div className={s.heroBadge}>
            <span className={s.heroBadgeDot} />
            Now in beta — free for personal trainers
          </div>
          <h1 className={s.heroHeadline}>
            YOUR CLIENTS.
            <br />
            YOUR <span className={s.accentPink}>RESULTS.</span>
            <br />
            YOUR <span className={s.accentCyan}>CONTROL.</span>
          </h1>
          <p className={s.heroSub}>
            Trainer is the CRM built for fitness professionals. Manage your
            roster, track client progress, and give your clients the tools to
            own their rehab — all in one place.
          </p>
          <div className={s.heroCta}>
            <Link href="/dashboard" className={s.btnHero}>
              Start for free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <a href="#features" className={s.btnHeroGhost}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M6 8l2 2 3-3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              See how it works
            </a>
          </div>
          <div className={s.heroStats}>
            <div>
              <div className={`${s.heroStatVal} ${s.colorPink}`}>2.4k+</div>
              <div className={s.heroStatLabel}>Trainers using Trainer</div>
            </div>
            <div className={s.heroStatDivider} />
            <div>
              <div className={`${s.heroStatVal} ${s.colorCyan}`}>18k+</div>
              <div className={s.heroStatLabel}>Clients managed</div>
            </div>
            <div className={s.heroStatDivider} />
            <div>
              <div className={`${s.heroStatVal} ${s.colorGreen}`}>94%</div>
              <div className={s.heroStatLabel}>Client program adherence</div>
            </div>
            <div className={s.heroStatDivider} />
            <div>
              <div className={s.heroStatVal}>4.9</div>
              <div className={s.heroStatLabel}>Average rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <div className={s.previewWrap}>
        <div className={s.previewFrame}>
          <div className={s.previewTopbar}>
            <div className={s.previewDots}>
              <div className={s.previewDot} style={{ background: "#ff5f56" }} />
              <div className={s.previewDot} style={{ background: "#ffbd2e" }} />
              <div className={s.previewDot} style={{ background: "#27c93f" }} />
            </div>
            <span className={s.previewUrl}>trainer.app / dashboard</span>
          </div>
          <div className={s.previewContent}>
            <div className={s.previewCard}>
              <div className={s.previewCardLabel}>Active Clients</div>
              <div className={`${s.previewCardVal} ${s.colorPink}`}>24</div>
              <div className={s.previewCardSub}>+3 this week</div>
              <div className={s.previewBarRow}>
                <div className={s.previewBarBg}>
                  <div
                    className={s.previewBarFill}
                    style={{ background: "var(--pink)", width: "72%" }}
                  />
                </div>
                <span className={s.previewBarPct}>72%</span>
              </div>
            </div>
            <div className={s.previewCard}>
              <div className={s.previewCardLabel}>In Rehab</div>
              <div className={`${s.previewCardVal} ${s.colorCyan}`}>7</div>
              <div className={s.previewCardSub}>2 progressed</div>
              <div className={s.previewBarRow}>
                <div className={s.previewBarBg}>
                  <div
                    className={s.previewBarFill}
                    style={{ background: "var(--cyan)", width: "44%" }}
                  />
                </div>
                <span className={s.previewBarPct}>44%</span>
              </div>
            </div>
            <div className={s.previewCard}>
              <div className={s.previewCardLabel}>Avg. Adherence</div>
              <div className={`${s.previewCardVal} ${s.colorGreen}`}>91%</div>
              <div className={s.previewCardSub}>↑ 6% vs last month</div>
              <div className={s.previewBarRow}>
                <div className={s.previewBarBg}>
                  <div
                    className={s.previewBarFill}
                    style={{ background: "#4ade80", width: "91%" }}
                  />
                </div>
                <span className={s.previewBarPct}>91%</span>
              </div>
            </div>
            <div className={s.previewWideCard}>
              <div className={s.previewWideLabel}>Recent Clients</div>
              <div className={s.previewClientRow}>
                <div
                  className={s.previewAvatar}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--pink), var(--cyan))",
                  }}
                >
                  JM
                </div>
                <div className={s.previewClientName}>Jordan Mills</div>
                <div className={s.previewProgress}>
                  <div
                    className={s.previewProgressFill}
                    style={{ width: "82%", background: "var(--pink)" }}
                  />
                </div>
                <div className={`${s.previewClientStatus} ${s.statusActive}`}>
                  Active
                </div>
              </div>
              <div className={s.previewClientRow}>
                <div
                  className={s.previewAvatar}
                  style={{
                    background: "linear-gradient(135deg, var(--cyan), #4ade80)",
                  }}
                >
                  SK
                </div>
                <div className={s.previewClientName}>Sara Kim</div>
                <div className={s.previewProgress}>
                  <div
                    className={s.previewProgressFill}
                    style={{ width: "58%", background: "var(--cyan)" }}
                  />
                </div>
                <div className={`${s.previewClientStatus} ${s.statusRehab}`}>
                  Rehab
                </div>
              </div>
              <div className={s.previewClientRow}>
                <div
                  className={s.previewAvatar}
                  style={{
                    background: "linear-gradient(135deg, #a78bfa, var(--pink))",
                  }}
                >
                  TW
                </div>
                <div className={s.previewClientName}>Tyler Walsh</div>
                <div className={s.previewProgress}>
                  <div
                    className={s.previewProgressFill}
                    style={{ width: "15%", background: "#a78bfa" }}
                  />
                </div>
                <div className={`${s.previewClientStatus} ${s.statusNew}`}>
                  New
                </div>
              </div>
            </div>
          </div>
          <div className={s.previewGlow} />
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className={s.section}>
        <div className={s.features}>
          <div className={s.sectionHeader}>
            <div className={s.sectionEyebrow}>Everything you need</div>
            <h2 className={s.sectionTitle}>
              BUILT FOR
              <br />
              HOW YOU TRAIN
            </h2>
            <p className={s.sectionDesc}>
              Stop juggling spreadsheets, texts, and notes. Trainer puts your
              whole practice in one clean command center.
            </p>
          </div>
          <div className={s.featuresGrid}>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconPink}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="7"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className={s.featureTitle}>Client Roster</div>
              <p className={s.featureDesc}>
                A live, searchable list of every client — injury history, goals,
                session notes, and contact info all in one place.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconCyan}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <polyline
                    points="3,14 7,9 11,12 17,5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="17" cy="5" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <div className={s.featureTitle}>Progress Tracking</div>
              <p className={s.featureDesc}>
                Log measurements, strength metrics, and milestone completions.
                Visualize every client's trajectory over time.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconGreen}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="14"
                    height="14"
                    rx="3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 10l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={s.featureTitle}>Program Builder</div>
              <p className={s.featureDesc}>
                Design custom exercise programs and assign them with a click.
                Clients see exactly what to do, when to do it.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconPink}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2L12.5 8H18L13.5 11.5L15.5 17.5L10 14L4.5 17.5L6.5 11.5L2 8H7.5L10 2Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className={s.featureTitle}>Rehab Protocols</div>
              <p className={s.featureDesc}>
                Assign injury-specific rehab programs with phase progressions.
                Track compliance and adapt in real time.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconCyan}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 4h12v8a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 17h4M10 14v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className={s.featureTitle}>Session Notes</div>
              <p className={s.featureDesc}>
                Keep a timestamped record of every session. Notes are private to
                you and searchable across your entire roster.
              </p>
            </div>
            <div className={s.featureCard}>
              <div className={`${s.featureIcon} ${s.iconGreen}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 6v4l3 2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className={s.featureTitle}>Scheduling</div>
              <p className={s.featureDesc}>
                Set recurring sessions, send reminders, and let clients confirm
                appointments without the back-and-forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trainer Panel Split ── */}
      <section className={s.section}>
        <div className={s.splitSection}>
          <div>
            <div className={s.splitLabel} style={{ color: "var(--pink)" }}>
              For Trainers
            </div>
            <h2 className={s.splitTitle}>
              MANAGE YOUR
              <br />
              <span className={s.accentPink}>ENTIRE ROSTER</span>
              <br />
              WITH EASE
            </h2>
            <p className={s.splitDesc}>
              See every client's status at a glance. Know who needs attention,
              who's crushing their goals, and who's due for a program update —
              without digging through notebooks.
            </p>
            <ul className={s.splitChecklist}>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Instant overview of all active, new, and rehab clients
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Flag clients who've missed sessions or fallen behind on programs
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Duplicate and reuse program templates across multiple clients
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Works on mobile — check in with clients from anywhere
              </li>
            </ul>
          </div>
          <div>
            <div className={s.trainerPanel}>
              <div className={s.trainerPanelTopbar}>
                <div className={s.trainerPanelDot} />
                <div className={s.trainerPanelTitle}>
                  TRAINER<span>.</span> Dashboard
                </div>
              </div>
              <div className={s.trainerPanelBody}>
                <div className={`${s.tpClient} ${s.tpClientSelected}`}>
                  <div
                    className={s.tpAv}
                    style={{
                      background:
                        "linear-gradient(135deg, var(--pink), var(--cyan))",
                    }}
                  >
                    JM
                  </div>
                  <div className={s.tpInfo}>
                    <div className={s.tpName}>Jordan Mills</div>
                    <div className={s.tpMeta}>Knee rehab · Week 6 of 12</div>
                  </div>
                  <div className={`${s.tpBadge} ${s.statusActive}`}>Active</div>
                </div>
                <div className={s.tpClient}>
                  <div
                    className={s.tpAv}
                    style={{
                      background:
                        "linear-gradient(135deg, var(--cyan), #4ade80)",
                    }}
                  >
                    SK
                  </div>
                  <div className={s.tpInfo}>
                    <div className={s.tpName}>Sara Kim</div>
                    <div className={s.tpMeta}>Strength · 3 sessions/wk</div>
                  </div>
                  <div className={`${s.tpBadge} ${s.statusRehab}`}>
                    On Track
                  </div>
                </div>
                <div className={s.tpClient}>
                  <div
                    className={s.tpAv}
                    style={{
                      background:
                        "linear-gradient(135deg, #a78bfa, var(--pink))",
                    }}
                  >
                    TW
                  </div>
                  <div className={s.tpInfo}>
                    <div className={s.tpName}>Tyler Walsh</div>
                    <div className={s.tpMeta}>Onboarding · Day 3</div>
                  </div>
                  <div className={`${s.tpBadge} ${s.statusNew}`}>New</div>
                </div>
                <div className={s.tpProg}>
                  <div className={s.tpProgHeader}>
                    <div className={s.tpProgLabel}>Jordan's Rehab Progress</div>
                    <div className={s.tpProgPct}>67%</div>
                  </div>
                  <div className={s.tpProgBar}>
                    <div className={s.tpProgFill} style={{ width: "67%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Client Control Split ── */}
      <section id="clients" className={s.section}>
        <div className={`${s.splitSection} ${s.splitReverse}`}>
          <div>
            <div className={s.splitLabel} style={{ color: "var(--cyan)" }}>
              For Clients
            </div>
            <h2 className={s.splitTitle}>
              TAKE CONTROL
              <br />
              OF YOUR <span className={s.accentCyan}>REHAB</span>
            </h2>
            <p className={s.splitDesc}>
              Clients aren't just passengers. Trainer gives them a dedicated
              mobile view to log workouts, track their own progress, and stay
              connected with you between sessions.
            </p>
            <ul className={s.splitChecklist}>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                See today's assigned exercises with sets, reps, and video cues
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Log completed sessions and pain/difficulty ratings
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Track personal milestones and see progress over time
              </li>
              <li>
                <span className={s.checkIcon}>
                  <CiCircleCheck />
                </span>
                Message your trainer directly inside the app
              </li>
            </ul>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className={s.phoneMockup}>
              <div className={s.phoneNotch}>
                <div className={s.phoneNotchPill} />
              </div>
              <div className={s.phoneBody}>
                <div className={s.phoneCard}>
                  <div className={s.phoneCardLabel}>Today's Program</div>
                  <div className={s.phoneProgressRow}>
                    <span className={s.phoneProgressLabel}>
                      Knee Rehab · Phase 2
                    </span>
                    <span className={s.phoneProgressPct}>3/5</span>
                  </div>
                  <div className={s.phoneBar}>
                    <div className={s.phoneBarFill} style={{ width: "60%" }} />
                  </div>
                  {[
                    {
                      name: "Terminal Knee Ext.",
                      sets: "3×15",
                      done: true,
                      color: "#4ade80",
                    },
                    {
                      name: "SL Calf Raise",
                      sets: "3×20",
                      done: true,
                      color: "#4ade80",
                    },
                    {
                      name: "Mini-Band Walks",
                      sets: "2×30",
                      done: true,
                      color: "#4ade80",
                    },
                    {
                      name: "Step-Ups",
                      sets: "3×12",
                      done: false,
                      color: "var(--cyan)",
                    },
                    {
                      name: "Wall Sit",
                      sets: "3×45s",
                      done: false,
                      color: "rgba(255,255,255,0.2)",
                    },
                  ].map((ex) => (
                    <div key={ex.name} className={s.phoneExerciseRow}>
                      <div
                        className={s.phoneExDot}
                        style={{ background: ex.color }}
                      />
                      <div className={s.phoneExName}>{ex.name}</div>
                      <div
                        className={`${s.phoneExDone}${ex.done ? ` ${s.done}` : ""}`}
                      >
                        {ex.sets}
                        {ex.done ? " ✓" : ""}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={s.phoneCard}>
                  <div className={s.phoneCardLabel}>Overall Recovery</div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 28,
                        fontWeight: 900,
                        color: "var(--cyan)",
                        lineHeight: 1,
                      }}
                    >
                      67%
                    </span>
                    <span
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}
                    >
                      complete
                    </span>
                  </div>
                  <div className={s.phoneBar} style={{ height: 8 }}>
                    <div className={s.phoneBarFill} style={{ width: "67%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Progress Tracking ── */}
      <section id="progress" className={s.section}>
        <div className={s.trackingSection}>
          <div className={s.sectionHeader}>
            <div className={s.sectionEyebrow}>Data-driven coaching</div>
            <h2 className={s.sectionTitle}>
              TRACK EVERY
              <br />
              METRIC THAT MATTERS
            </h2>
            <p className={s.sectionDesc}>
              From strength gains to range of motion, Trainer surfaces the
              numbers that tell you if your programming is working.
            </p>
          </div>
          <div className={s.metricsGrid}>
            <div className={`${s.metricCard} ${s.mPink}`}>
              <div className={`${s.metricNum} ${s.colorPink}`}>+34</div>
              <div className={s.metricUnit}>lbs / avg client</div>
              <div className={s.metricLabel}>Strength Gained</div>
              <p className={s.metricDesc}>
                Track 1RM progress across key lifts and watch your clients hit
                new PRs.
              </p>
              <div className={s.miniSparkline}>
                {[30, 40, 50, 45, 60, 75, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className={s.sparkBar}
                    style={{
                      height: `${h}%`,
                      background:
                        i < 5
                          ? "rgba(253,109,187,0.3)"
                          : i < 7
                            ? "rgba(253,109,187,0.5)"
                            : "var(--pink)",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={`${s.metricCard} ${s.mCyan}`}>
              <div className={`${s.metricNum} ${s.colorCyan}`}>6</div>
              <div className={s.metricUnit}>weeks avg recovery</div>
              <div className={s.metricLabel}>Faster Rehab</div>
              <p className={s.metricDesc}>
                Rehab clients on Trainer return to full activity weeks ahead of
                industry average.
              </p>
              <div className={s.miniSparkline}>
                {[100, 90, 80, 70, 60, 45, 35, 20].map((h, i) => (
                  <div
                    key={i}
                    className={s.sparkBar}
                    style={{
                      height: `${h}%`,
                      background: `rgba(52,253,254,${0.15 + i * 0.075})`,
                    }}
                  />
                ))}
              </div>
            </div>
            <div className={`${s.metricCard} ${s.mGreen}`}>
              <div className={`${s.metricNum} ${s.colorGreen}`}>94%</div>
              <div className={s.metricUnit}>program adherence</div>
              <div className={s.metricLabel}>Client Compliance</div>
              <p className={s.metricDesc}>
                Clients with access to Trainer's app complete nearly all
                assigned sessions.
              </p>
              <div className={s.miniSparkline}>
                {[60, 65, 70, 80, 85, 90, 92, 100].map((h, i) => (
                  <div
                    key={i}
                    className={s.sparkBar}
                    style={{
                      height: `${h}%`,
                      background: `rgba(74,222,128,${0.2 + i * 0.08})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className={s.section}>
        <div className={s.testimonials}>
          <div className={s.sectionHeader}>
            <div className={s.sectionEyebrow}>From trainers like you</div>
            <h2 className={s.sectionTitle}>
              WHAT PROS
              <br />
              ARE SAYING
            </h2>
          </div>
          <div className={s.testimonialsGrid}>
            <div className={s.testimonialCard}>
              <div className={s.testimonialStars}>★★★★★</div>
              <p className={s.testimonialQuote}>
                "I used to lose track of rehab clients constantly. Trainer's
                dashboard makes it impossible to miss a thing — I know exactly
                where everyone is at any moment."
              </p>
              <div className={s.testimonialAuthor}>
                <div
                  className={s.tAvatar}
                  style={{
                    background: "linear-gradient(135deg, var(--pink), #a78bfa)",
                  }}
                >
                  MR
                </div>
                <div>
                  <div className={s.tName}>Marcus Reid</div>
                  <div className={s.tRole}>PT &amp; Strength Coach · 8 yrs</div>
                </div>
              </div>
            </div>
            <div className={s.testimonialCard}>
              <div className={s.testimonialStars}>★★★★★</div>
              <p className={s.testimonialQuote}>
                "My rehab clients love having their own view. They can see what
                they need to do, log it, and feel like they're in the driver's
                seat. Compliance went through the roof."
              </p>
              <div className={s.testimonialAuthor}>
                <div
                  className={s.tAvatar}
                  style={{
                    background: "linear-gradient(135deg, var(--cyan), #4ade80)",
                  }}
                >
                  AJ
                </div>
                <div>
                  <div className={s.tName}>Aisha Jones</div>
                  <div className={s.tRole}>Sports Rehab Specialist</div>
                </div>
              </div>
            </div>
            <div className={s.testimonialCard}>
              <div className={s.testimonialStars}>★★★★★</div>
              <p className={s.testimonialQuote}>
                "The program builder alone saved me hours every week. I set up
                templates for my most common protocols and just plug clients in.
                Absolute game changer."
              </p>
              <div className={s.testimonialAuthor}>
                <div
                  className={s.tAvatar}
                  style={{
                    background: "linear-gradient(135deg, #f59e0b, var(--pink))",
                  }}
                >
                  DK
                </div>
                <div>
                  <div className={s.tName}>Derek Kim</div>
                  <div className={s.tRole}>Personal Trainer · 12 yrs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={s.section}>
        <div className={s.ctaSection}>
          <div className={s.ctaInner}>
            <h2 className={s.ctaTitle}>
              READY TO TRAIN
              <br />
              <span className={s.accentPink}>SMARTER?</span>
            </h2>
            <p className={s.ctaSub}>
              Join thousands of trainers who've moved their practice out of
              spreadsheets and into the future.
            </p>
            <div className={s.ctaButtons}>
              <Link href="/dashboard" className={s.btnHeroGhost}>
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLogo}>
            TRAINER<span>.</span>
          </div>
          <ul className={s.footerLinks}>
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">Privacy</a>
            </li>
            <li>
              <a href="#">Terms</a>
            </li>
          </ul>
          <div className={s.footerCopy}>
            © 2026 Trainer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
