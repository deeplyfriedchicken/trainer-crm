"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { authenticate } from "../actions";

type Mode = "enter" | "create" | "confirm";

interface Props {
  token: string;
  hasPin: boolean;
}

export function PinModal({ token, hasPin }: Props) {
  const [mode, setMode] = useState<Mode>(hasPin ? "enter" : "create");
  const [digits, setDigits] = useState<string[]>([]);
  const [firstPin, setFirstPin] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [shaking, setShaking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dotsRef = useRef<HTMLDivElement>(null);

  const shake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const handleKey = useCallback(
    (key: string) => {
      if (isPending) return;
      setError("");

      if (key === "del") {
        setDigits((d) => d.slice(0, -1));
        return;
      }

      const next = [...digits, key];
      setDigits(next);

      if (next.length < 6) return;

      const pin = next.join("");

      if (mode === "enter") {
        startTransition(async () => {
          const result = await authenticate(token, pin, false);
          if (result?.error) {
            setError(result.error);
            shake();
            setDigits([]);
          }
        });
      } else if (mode === "create") {
        setFirstPin(pin);
        setDigits([]);
        setMode("confirm");
      } else {
        // confirm mode
        if (pin === firstPin) {
          startTransition(async () => {
            const result = await authenticate(token, pin, true);
            if (result?.error) {
              setError(result.error);
              shake();
              setDigits([]);
              setMode("create");
              setFirstPin("");
            }
          });
        } else {
          setError("PINs don't match. Try again.");
          shake();
          setDigits([]);
          setMode("create");
          setFirstPin("");
        }
      }
    },
    [digits, mode, firstPin, token, isPending, shake],
  );

  const title =
    mode === "enter"
      ? "Enter PIN"
      : mode === "create"
        ? "Create PIN"
        : "Confirm PIN";

  const subtitle =
    mode === "enter"
      ? "Enter your 6-digit PIN to continue"
      : mode === "create"
        ? "Choose a 6-digit PIN to secure your portal"
        : "Re-enter your PIN to confirm";

  const keys = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    "", "0", "del",
  ];

  return (
    <div className="pin-overlay">
      <div className="pin-logo">
        TBD<span>Fit</span>
      </div>
      <div className="pin-card">
        <div className="pin-title">{title}</div>
        <div className="pin-subtitle">{subtitle}</div>

        <div
          ref={dotsRef}
          className={`pin-dots${shaking ? " shake" : ""}`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`pin-dot${
                i < digits.length
                  ? shaking
                    ? " error"
                    : " filled"
                  : ""
              }`}
            />
          ))}
        </div>

        <div className="pin-numpad">
          {keys.map((k, i) =>
            k === "" ? (
              <div key={i} className="pin-key empty" />
            ) : k === "del" ? (
              <button
                key={i}
                className="pin-key delete"
                onClick={() => handleKey("del")}
                disabled={isPending}
                type="button"
              >
                ⌫
              </button>
            ) : (
              <button
                key={i}
                className="pin-key"
                onClick={() => handleKey(k)}
                disabled={isPending || digits.length >= 6}
                type="button"
              >
                {k}
              </button>
            ),
          )}
        </div>

        <div className="pin-error">{error}</div>
        {mode === "confirm" && !error && (
          <div className="pin-confirm-hint">
            Re-enter the PIN you just created
          </div>
        )}
      </div>
    </div>
  );
}
