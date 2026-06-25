"use client";

import { useEffect, useRef } from "react";

export type CountdownState = {
  exIdx: number;
  setIdx: number;
  remaining: number;
  total: number;
  skipStartBeep?: true;
} | null;

export type PreCountdownState = {
  exIdx: number;
  setIdx: number;
  n: 1 | 2 | 3;
} | null;

const START_FREQ_HZ = 440;
const TICK_FREQ_HZ = 660;
const COMPLETE_FREQ_HZ = 880;
const SHORT_TONE_MS = 100;
const PRE_TONE_MS = 500;
const COMPLETE_TONE_MS = 350;
const PEAK_GAIN = 0.3;

export function useCountdownBeeps(
  preState: PreCountdownState,
  cdState: CountdownState,
): void {
  const ctxRef = useRef<AudioContext | null>(null);
  const prevCdRef = useRef<CountdownState>(null);
  const prevPreRef = useRef<PreCountdownState>(null);

  useEffect(() => {
    return () => {
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  // Pre-countdown: tick on 3 and 2, start tone on 1 ("Go!").
  useEffect(() => {
    const prev = prevPreRef.current;
    prevPreRef.current = preState;

    if (preState && (!prev || prev.n !== preState.n)) {
      const freq = preState.n === 1 ? START_FREQ_HZ : TICK_FREQ_HZ;
      playTone(ensureCtx(ctxRef), freq, PRE_TONE_MS);
    }
  }, [preState]);

  // Main countdown: start (unless suppressed), milestones, final-5, complete.
  useEffect(() => {
    const prev = prevCdRef.current;
    prevCdRef.current = cdState;

    if (!prev && cdState) {
      if (!cdState.skipStartBeep) {
        playTone(ensureCtx(ctxRef), START_FREQ_HZ, SHORT_TONE_MS);
      }
      return;
    }

    if (prev && !cdState) {
      if (prev.remaining === 1) {
        playTone(ensureCtx(ctxRef), COMPLETE_FREQ_HZ, COMPLETE_TONE_MS);
      }
      return;
    }

    if (prev && cdState && prev.remaining !== cdState.remaining) {
      const r = cdState.remaining;
      const isFinalFive = r >= 1 && r <= 5;
      const isMilestone = r > 5 && r % 10 === 0;
      if (isFinalFive || isMilestone) {
        playTone(ensureCtx(ctxRef), TICK_FREQ_HZ, SHORT_TONE_MS);
      }
    }
  }, [cdState]);
}

function ensureCtx(ref: React.MutableRefObject<AudioContext | null>): AudioContext | null {
  if (ref.current) return ref.current;
  const Ctor =
    typeof window !== "undefined"
      ? window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      : undefined;
  if (!Ctor) return null;
  ref.current = new Ctor();
  return ref.current;
}

function playTone(
  ctx: AudioContext | null,
  freqHz: number,
  durationMs: number,
): void {
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freqHz;

  const now = ctx.currentTime;
  const dur = durationMs / 1000;
  const attack = 0.01;
  const release = 0.02;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(PEAK_GAIN, now + attack);
  gain.gain.setValueAtTime(PEAK_GAIN, now + Math.max(attack, dur - release));
  gain.gain.linearRampToValueAtTime(0, now + dur);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + dur);
}
