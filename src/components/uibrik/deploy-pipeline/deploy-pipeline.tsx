"use client";

// A deploy card that runs itself: each step spins, ticks its own timer, then
// checks off while a line fills down the rail to the next one. When the last
// step lands the card turns Ready and shows the live URL. It runs when scrolled
// into view and, if looping, resets and runs again. Reduced motion shows it finished.

import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const ROW = 44;

export type DeployStep = {
  label: string;
  /** Seconds this step takes to run in the animation. */
  duration?: number;
};

export type DeployPipelineProps = {
  steps?: readonly DeployStep[];
  /** Shown in the header, e.g. the branch or environment. */
  environment?: string;
  /** Commit shown under the environment. */
  commit?: string;
  /** Address shown once ready. */
  url?: string;
  /** Multiplies every step's duration. */
  pace?: number;
  /** Run again after a pause once finished. */
  loop?: boolean;
  /** Seconds the finished card stays before it reruns. */
  hold?: number;
  className?: string;
};

export const DEFAULT_STEPS: readonly DeployStep[] = [
  { label: "Clone repository", duration: 0.6 },
  { label: "Install dependencies", duration: 1.4 },
  { label: "Build", duration: 1.8 },
  { label: "Run checks", duration: 1 },
  { label: "Deploy to edge", duration: 0.9 },
];

/** `waiting`: the step at `active` hasn't started yet (the line is still on its way to it). */
type Run = { active: number; elapsed: number[]; ready: boolean; waiting?: boolean };

// After a step checks off: a beat for the check to draw, then the line runs to the next step.
const CHECK_MS = 300;
const CONNECT_MS = 320;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// Resolves on the next animation frame, so timers and the rail move every frame.
const frame = (signal: AbortSignal) =>
  new Promise<number>((resolve, reject) => {
    const id = requestAnimationFrame(resolve);
    signal.addEventListener("abort", () => {
      cancelAnimationFrame(id);
      reject(signal.reason);
    });
  });

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(t);
      reject(signal.reason);
    });
  });

export function DeployPipeline({
  steps = DEFAULT_STEPS,
  environment = "Production",
  commit = "a1f9c2e · Tighten checkout spacing",
  url = "acme.app",
  pace = 1,
  loop = true,
  hold = 3,
  className,
}: DeployPipelineProps) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const [playing, setRun] = useState<Run>(() => ({ active: -1, elapsed: steps.map(() => 0), ready: false }));
  const run: Run = reduce ? { active: steps.length, elapsed: steps.map((s) => s.duration ?? 1), ready: true } : playing;
  const [cycle, setCycle] = useState(0);
  // Share of the rail filled, 0–1. Set every frame, outside React.
  const rail = useMotionValue(reduce ? 1 : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const ac = new AbortController();
    const { signal } = ac;

    (async () => {
      setRun({ active: -1, elapsed: steps.map(() => 0), ready: false });
      rail.set(0);
      await sleep(500, signal);
      const elapsed = steps.map(() => 0);
      const gaps = Math.max(1, steps.length - 1);
      for (let i = 0; i < steps.length; i++) {
        const total = (steps[i].duration ?? 1) * pace * 1000;
        const start = performance.now();
        while (true) {
          const t = Math.min(total, (await frame(signal)) - start);
          elapsed[i] = t / 1000;
          setRun({ active: i, elapsed: [...elapsed], ready: false });
          if (t >= total) break;
        }
        if (i === steps.length - 1) break;
        // Check this step off, let the check draw, then run the line down to the next one.
        setRun({ active: i + 1, elapsed: [...elapsed], ready: false, waiting: true });
        await sleep(CHECK_MS, signal);
        const from = performance.now();
        while (true) {
          const t = Math.min(1, ((await frame(signal)) - from) / CONNECT_MS);
          rail.set((i + easeOut(t)) / gaps);
          if (t >= 1) break;
        }
      }
      setRun({ active: steps.length, elapsed: [...elapsed], ready: false });
      await sleep(250, signal);
      setRun({ active: steps.length, elapsed: [...elapsed], ready: true });
      if (!loop) return;
      await sleep(hold * 1000, signal);
      setCycle((c) => c + 1);
    })().catch(() => {});

    return () => ac.abort();
  }, [inView, reduce, steps, pace, loop, hold, cycle, rail]);

  const total = run.elapsed.reduce((a, b) => a + b, 0);
  const status = run.ready ? "ready" : run.active >= 0 ? "building" : "queued";

  return (
    <div
      ref={root}
      className={cn(
        "w-full max-w-sm rounded-3xl bg-background p-5",
        "shadow-[inset_0_0_0_1px_var(--border),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-12px_rgb(0_0_0/0.12)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{environment}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{commit}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <ol className="relative mt-5" aria-label="Deploy steps">
        {/* Rail behind the icons, and the part already travelled. */}
        <span aria-hidden className="absolute left-[9.5px] w-px bg-border" style={{ top: ROW / 2, height: (steps.length - 1) * ROW }} />
        <motion.span
          aria-hidden
          className="absolute left-[9.5px] w-px origin-top bg-foreground"
          style={{ top: ROW / 2, height: (steps.length - 1) * ROW, scaleY: rail }}
        />
        {steps.map((step, i) => {
          const state = i < run.active ? "done" : i === run.active && !run.waiting ? "running" : "pending";
          return (
            <li key={step.label} className="relative flex items-center gap-3" style={{ height: ROW }}>
              <StepIcon state={state} />
              <span className={cn("flex-1 text-sm transition-colors duration-300", state === "pending" ? "text-muted-foreground" : "text-foreground")}>
                {step.label}
              </span>
              <span className={cn("font-mono text-xs tabular-nums transition-opacity duration-300", state === "pending" ? "opacity-0" : "text-muted-foreground")}>
                {run.elapsed[i].toFixed(1)}s
              </span>
            </li>
          );
        })}
      </ol>

      {/* Footer keeps its height through every state, so the card never resizes. */}
      <div className="mt-4 flex h-10 items-center justify-between rounded-xl bg-muted px-3 text-sm">
        {/* Both states share one box and cross-fade, so nothing shifts. */}
        <span className="relative h-full flex-1">
          <AnimatePresence initial={false}>
            {run.ready ? (
              <motion.span
                key="ready"
                initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-y-0 left-0 flex items-center gap-2 whitespace-nowrap text-foreground"
              >
                <span className="size-1.5 rounded-full bg-green-500" />
                {url}
              </motion.span>
            ) : (
              <motion.span
                key="wait"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-muted-foreground"
              >
                {status === "queued" ? "Waiting to start" : "Deploying…"}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{total.toFixed(1)}s</span>
      </div>
      <span role="status" className="sr-only">
        {run.ready ? `Deployed to ${url}` : ""}
      </span>
    </div>
  );
}

const STATUS = { queued: "Queued", building: "Building", ready: "Ready" } as const;
const ORDER = Object.keys(STATUS) as (keyof typeof STATUS)[];

function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  return (
    <span className="flex h-6 shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-muted px-2.5 text-xs font-medium text-foreground">
      <span
        className={cn(
          "size-1.5 rounded-full transition-colors duration-300",
          status === "ready" ? "bg-green-500" : status === "building" ? "bg-amber-500" : "bg-foreground/25",
        )}
      />
      {/* Every label sits in the same cell, so the badge is always as wide as the longest. */}
      <span className="grid">
        {ORDER.map((k) => (
          <motion.span
            key={k}
            aria-hidden={k !== status}
            initial={false}
            // Earlier states roll up and out, later ones wait below.
            animate={k === status ? { y: 0, opacity: 1 } : { y: ORDER.indexOf(k) < ORDER.indexOf(status) ? "-100%" : "100%", opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="col-start-1 row-start-1"
          >
            {STATUS[k]}
          </motion.span>
        ))}
      </span>
    </span>
  );
}

function StepIcon({ state }: { state: "pending" | "running" | "done" }) {
  const t = { duration: 0.25, ease: EASE_OUT };
  return (
    // Icons stack in a fixed 20px box and cross-fade; none of them takes layout space.
    <span className="relative z-10 size-5 shrink-0 rounded-full bg-background [&>svg]:absolute [&>svg]:inset-0">
      <AnimatePresence initial={false}>
        {state === "done" ? (
          <motion.svg
            key="done"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            aria-hidden
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t}
          >
            <circle cx={10} cy={10} r={10} className="fill-foreground" />
            <motion.path
              d="M6.2 10.3 8.7 12.8 13.8 7.5"
              fill="none"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-background"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ ...t, delay: 0.08 }}
            />
          </motion.svg>
        ) : state === "running" ? (
          <motion.svg key="running" width={20} height={20} viewBox="0 0 20 20" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
            <circle cx={10} cy={10} r={8.25} fill="none" strokeWidth={1.5} className="stroke-foreground/15" />
            <path d="M10 1.75A8.25 8.25 0 0 1 18.25 10" fill="none" strokeWidth={1.5} strokeLinecap="round" className="origin-center animate-spin stroke-foreground [transform-box:view-box]" />
          </motion.svg>
        ) : (
          <motion.svg key="pending" width={20} height={20} viewBox="0 0 20 20" aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t}>
            <circle cx={10} cy={10} r={8.25} fill="none" strokeWidth={1.5} strokeDasharray="2 3" className="stroke-foreground/25" />
          </motion.svg>
        )}
      </AnimatePresence>
    </span>
  );
}
