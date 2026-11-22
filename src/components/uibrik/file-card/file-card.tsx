"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const SPRING = { type: "spring", duration: 0.5, bounce: 0 } as const;

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500";

const SHELL = "edge-outer rounded-3xl bg-muted/70 p-1.5 dark:bg-muted/60";

const PANEL = "edge-inner rounded-[18px] bg-background";

function CardShell({
  title,
  meta,
  actions,
  footer,
  className,
  panelClassName,
  children,
}: {
  title: ReactNode;
  /** Muted, beside the title. */
  meta?: ReactNode;
  /** Right of the heading row. */
  actions?: ReactNode;
  /** One muted line under the panel. */
  footer?: ReactNode;
  className?: string;
  panelClassName?: string;
  children: ReactNode;
}) {
  return (
    <article className={cn(SHELL, "flex w-full flex-col transition-colors", className)}>
      <header className="flex min-h-11 items-center justify-between gap-3 pl-3 pr-1">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3 className="truncate text-sm font-medium text-foreground">{title}</h3>
          {meta && <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">{meta}</span>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-0.5">{actions}</div>}
      </header>
      <div className={cn(PANEL, "relative overflow-hidden", panelClassName)}>{children}</div>
      {footer && <div className="min-h-9 px-3 pt-2.5 pb-1.5 text-[13px] text-muted-foreground">{footer}</div>}
    </article>
  );
}

// File card. A document on the card's panel, drawn as a sheet of paper.
// Pointing at it curls the bottom-right corner up to show the page beneath;
// pressing curls it further. Older versions sit behind it, the version tab
// shows the count and the line under the panel says who changed it last.
//
// The curl is one spring (the fold's size, px). The page is clipped along
// the fold, and the flap is the cut-off triangle folded over: a triangle the
// same size, shaded from the fold to its tip, with a soft shadow under it.

export type FileVersion = {
  /** Who made this version. */
  author?: string;
  /** When, already formatted: "2h ago", "Just now". */
  time?: string;
  /** Image of the first page, instead of the drawn one. */
  preview?: string;
};

export type FileCardProps = {
  name?: string;
  /** Muted, beside the name: type and size. */
  meta?: string;
  /** Versions, oldest first. The last is the one on top. */
  versions?: FileVersion[];
  /** How far the corner curls on hover, px. */
  curl?: number;
  /** Called when the sheet is clicked. */
  onOpen?: () => void;
  className?: string;
};

const VERSIONS: FileVersion[] = [
  { author: "Maya", time: "Mon" },
  { author: "Ava", time: "2h ago" },
];

const W = 196; // sheet width, px
const H = Math.round(W * (11 / 8.5)); // US letter
const BEHIND = 2; // older sheets drawn behind the current one

export function FileCard({
  name = "Q4 planning.pdf",
  meta = "PDF · 2.4 MB",
  versions = VERSIONS,
  curl = 46,
  onOpen,
  className,
}: FileCardProps) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const fold = useSpring(0, reduce ? { duration: 0 } : { stiffness: 380, damping: 32 });
  const target = press ? curl * 1.7 : hover ? curl : 0;
  useEffect(() => fold.set(target), [fold, target]);

  const count = versions.length;
  const current = versions[count - 1];

  return (
    <CardShell
      title={name}
      meta={meta}
      className={cn("max-w-80", className)}
      actions={
        <span className="edge-tile relative mr-1 grid h-6 min-w-8 place-items-center overflow-hidden rounded-full bg-background px-2 text-xs font-medium text-foreground tabular-nums">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={count}
              initial={{ y: reduce ? 0 : 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: reduce ? 0 : -12, opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              v{count}
            </motion.span>
          </AnimatePresence>
        </span>
      }
      footer={
        <div className="relative h-5 overflow-hidden" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.p
              key={count}
              className="truncate"
              initial={{ opacity: 0, y: reduce ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -6 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              Edited {current?.time ?? "recently"}
              {current?.author && (
                <>
                  {" "}
                  by <span className="font-medium text-foreground">{current.author}</span>
                </>
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      }
    >
      <div className="relative grid place-items-center bg-[radial-gradient(circle,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)] bg-size-[14px_14px] py-9">
        <div className="relative" style={{ width: W, height: H }}>
          <AnimatePresence initial={false}>
            {versions.map((version, i) => {
              const depth = count - 1 - i;
              if (depth > BEHIND) return null;
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0 origin-bottom-left"
                  style={{ zIndex: BEHIND + 1 - depth }}
                  initial={{ y: reduce ? 0 : -40, opacity: 0, rotate: 0, x: 0, scale: 1.02 }}
                  animate={{
                    x: depth * 7,
                    y: -depth * 7,
                    rotate: depth * 2.5,
                    scale: 1 - depth * 0.03,
                    opacity: depth === 0 ? 1 : 1 - depth * 0.25,
                  }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                >
                  {depth === 0 ? (
                    <button
                      type="button"
                      aria-label={`Open ${name}, version ${count}`}
                      className={cn("block size-full rounded-[3px] text-left", FOCUS)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
                      onPointerLeave={() => {
                        setHover(false);
                        setPress(false);
                      }}
                      onPointerDown={() => setPress(true)}
                      onPointerUp={() => setPress(false)}
                      onFocus={(e) => e.target.matches(":focus-visible") && setHover(true)}
                      onBlur={() => setHover(false)}
                      onClick={onOpen}
                    >
                      <Curled fold={fold} version={version} seed={i} />
                    </button>
                  ) : (
                    <Sheet>
                      <Page seed={i} preview={version.preview} />
                    </Sheet>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </CardShell>
  );
}

// ─── Paper ───────────────────────────────────────────────────────────────────

const PAPER =
  "absolute inset-0 overflow-hidden rounded-[3px] bg-white ring-1 ring-black/[0.06] dark:bg-zinc-800 dark:ring-white/[0.08]";

function Sheet({ children, className, style }: { children: ReactNode; className?: string; style?: object }) {
  return (
    <div
      className={cn(PAPER, "shadow-[0_1px_2px_rgb(0_0_0/0.05),0_8px_20px_-10px_rgb(0_0_0/0.18)]", className)}
      style={style}
    >
      {children}
    </div>
  );
}

/** The current sheet: page one, clipped along the fold, over page two, with the folded flap. */
function Curled({ fold, version, seed }: { fold: ReturnType<typeof useSpring>; version: FileVersion; seed: number }) {
  const clip = useTransform(
    fold,
    (c) => `polygon(0 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%)`,
  );
  const size = useTransform(fold, (c) => c);
  // The shadow the flap casts grows as it lifts.
  const shadow = useTransform(fold, (c) => `drop-shadow(-2px -2px ${2 + c * 0.08}px rgb(0 0 0 / ${Math.min(0.22, c * 0.004)}))`);

  return (
    <div className="absolute inset-0">
      {/* Page two, seen where the corner lifts. */}
      <Sheet className="shadow-none">
        <Page seed={seed} second />
      </Sheet>
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        <Sheet>
          <Page seed={seed} preview={version.preview} />
        </Sheet>
      </motion.div>
      {/* The flap: the cut-off corner folded over, its back shaded from the fold to the tip. */}
      <motion.div className="pointer-events-none absolute right-0 bottom-0" style={{ width: size, height: size, filter: shadow }}>
        <div
          className="size-full rounded-tl-[3px] [--flap-a:#ffffff] [--flap-b:#e4e4e7] [--flap-c:#d4d4d8] dark:[--flap-a:#52525b] dark:[--flap-b:#3f3f46] dark:[--flap-c:#27272a]"
          style={{
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
            background: "linear-gradient(135deg, var(--flap-a) 0%, var(--flap-b) 38%, var(--flap-c) 50%)",
          }}
        />
      </motion.div>
    </div>
  );
}

/** A drawn page, different for each version. */
function Page({ seed, second, preview }: { seed: number; second?: boolean; preview?: string }) {
  if (preview && !second)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={preview} alt="" draggable={false} className="size-full object-cover" />;

  const rand = random(seed * 7 + (second ? 3 : 1));
  const line = (key: string, w: number, strong = false) => (
    <div key={key} className={cn("h-[3px] rounded-full", strong ? "bg-foreground/20" : "bg-foreground/[0.09]")} style={{ width: `${w}%` }} />
  );
  const paragraph = (key: string, lines: number) => (
    <div key={key} className="flex flex-col gap-[5px]">
      {Array.from({ length: lines }, (_, i) => line(`${key}-${i}`, i === lines - 1 ? 40 + rand() * 30 : 88 + rand() * 12))}
    </div>
  );

  if (second)
    return (
      <div className="flex h-full flex-col gap-3.5 p-5">
        {line("h", 46, true)}
        <div className="flex flex-col">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-foreground/[0.06] py-[7px]">
              {line(`a${i}`, 30 + rand() * 20)}
              <div className="ml-auto h-[3px] w-6 rounded-full bg-foreground/[0.09]" />
            </div>
          ))}
        </div>
        {paragraph("p", 3)}
      </div>
    );

  const figure = seed % 2 === 1;
  return (
    <div className="flex h-full flex-col gap-3.5 p-5">
      <div className="flex items-center gap-1.5">
        <div className="size-2 rounded-full bg-foreground/25" />
        <div className="h-[3px] w-8 rounded-full bg-foreground/15" />
      </div>
      <div className="flex flex-col gap-[6px] pt-1">
        {line("t1", 70 + rand() * 20, true)}
        {line("t2", 40 + rand() * 20, true)}
      </div>
      {paragraph("p1", 4)}
      {figure ? (
        <div className="flex h-12 items-end gap-1.5 rounded-sm bg-foreground/[0.04] px-2 pb-1.5">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="flex-1 rounded-[1px] bg-foreground/15" style={{ height: `${25 + rand() * 70}%` }} />
          ))}
        </div>
      ) : (
        paragraph("p2", 3)
      )}
      {paragraph("p3", 3)}
    </div>
  );
}

/** Small seeded generator, so each version's page is drawn the same every render. */
function random(seed: number) {
  let s = seed + 0x6d2b79f5;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
