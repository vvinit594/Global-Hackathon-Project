import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Check, ChevronDown, Copy, X } from "lucide-react";
import { toast } from "sonner";

export const cn = (...a: ClassValue[]) => twMerge(clsx(a));
export const money = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- Brand ---------- */
export function Logo({ size = 32, mono = false, className }: { size?: number; mono?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} role="img" aria-label="Stealth Pay">
      <defs>
        <mask id={`m${id}`}>
          <path d="M16 2 28 6.2V15c0 7-4.8 12-12 15C8.8 27 4 22 4 15V6.2Z" fill="#fff" />
          <path d="M14.4 11.5h3.2v6.2L16 20l-1.6-2.3Z" fill="#000" />
          <rect x="14.4" y="21.4" width="3.2" height="2" fill="#000" />
        </mask>
      </defs>
      <g mask={`url(#m${id})`}>
        <path d="M16 2v28C8.8 27 4 22 4 15V6.2Z" fill="currentColor" className={mono ? "" : "text-[#2A3238] dark:text-[#E9E7DF]"} />
        <path d="M16 2 28 6.2V15c0 7-4.8 12-12 15Z" fill={mono ? "currentColor" : "var(--copper)"} opacity={mono ? 0.7 : 1} />
      </g>
    </svg>
  );
}
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-semibold tracking-[0.14em] text-[15px] leading-none uppercase", className)}>
      Stealth<span className="text-copper">Pay</span>
    </span>
  );
}
export const Brand = ({ onClick }: { onClick?: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2.5 rounded-sm" aria-label="Stealth Pay home">
    <Logo size={30} />
    <Wordmark />
  </button>
);

/* ---------- Primitives ---------- */
export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("font-mono text-[11px] uppercase tracking-[0.16em] text-mute", className)}>{children}</p>
);

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { v?: "primary" | "secondary" | "ghost" | "danger"; s?: "sm" | "md" | "lg" };
export function Btn({ v = "primary", s = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap",
        s === "sm" && "h-9 px-3 text-[13px] rounded-sm",
        s === "md" && "h-11 px-4 text-sm",
        s === "lg" && "h-12 px-6 text-[15px]",
        v === "primary" && "bg-copper text-on-copper hover:bg-copper-hover shadow-card",
        v === "secondary" && "bg-elev text-foreground border border-strong hover:bg-surface-2",
        v === "ghost" && "text-text2 hover:bg-surface-2 hover:text-foreground",
        v === "danger" && "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/15",
        className
      )}
    />
  );
}

export function Card({ children, className, tone = "solid" }: { children: ReactNode; className?: string; tone?: "solid" | "panel" | "glass" | "feature" }) {
  return (
    <div
      className={cn(
        "border",
        tone === "solid" && "bg-surface rounded-lg shadow-card",
        tone === "panel" && "bg-surface-2/60 rounded-xl",
        tone === "glass" && "bg-glass backdrop-blur-md rounded-xl",
        tone === "feature" && "bg-surface rounded-2xl shadow-raised",
        className
      )}
    >
      {children}
    </div>
  );
}

export type Tone = "ok" | "wait" | "bad" | "neutral" | "copper";
export function Badge({ tone = "neutral", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  const t = {
    ok: "bg-teal-soft text-teal",
    wait: "bg-warn-soft text-warn-text",
    bad: "bg-danger-soft text-danger",
    neutral: "bg-surface-2 text-text2",
    copper: "bg-copper-soft text-copper-hover dark:text-copper",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-wider", t)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export function Field({ label, hint, error, children, right }: { label: string; hint?: string; error?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-foreground">{label}</label>
        {right}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-mute">{hint}</p>
      ) : null}
    </div>
  );
}
type InProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; mono?: boolean; trail?: ReactNode; lead?: ReactNode };
export function Input({ invalid, mono, trail, lead, className, ...p }: InProps) {
  return (
    <div className="relative">
      {lead && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mute">{lead}</span>}
      <input
        {...p}
        className={cn(
          "h-11 w-full rounded-md border bg-elev px-3 text-sm text-foreground placeholder:text-mute/80 transition-shadow",
          "border-strong hover:border-mute focus:border-copper focus:outline-none focus:ring-[3px] focus:ring-copper/20",
          mono && "font-mono text-[13px]",
          lead && "pl-10",
          trail && "pr-11",
          invalid && "border-danger focus:border-danger focus:ring-danger/20",
          className
        )}
      />
      {trail && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trail}</span>}
    </div>
  );
}

export function Select<T extends string>({ value, onChange, options, label, className, mono }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; sub?: string }[]; label: string; className?: string; mono?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", f);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", f); document.removeEventListener("keydown", k); };
  }, []);
  const cur = options.find((o) => o.value === value)!;
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-md border border-strong bg-elev px-3 text-sm hover:border-mute focus:border-copper focus:outline-none focus:ring-[3px] focus:ring-copper/20">
        <span className={cn("truncate", mono && "font-mono text-[13px]")}>{cur.label}</span>
        <ChevronDown size={16} className={cn("shrink-0 text-mute transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul role="listbox" className="animate-in fade-in-0 zoom-in-95 duration-150 absolute z-40 mt-1.5 w-full min-w-[180px] overflow-hidden rounded-lg border bg-popover p-1 shadow-raised">
          {options.map((o) => (
            <li key={o.value}>
              <button type="button" role="option" aria-selected={o.value === value} onClick={() => { onChange(o.value); setOpen(false); }}
                className={cn("flex w-full items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-left text-sm hover:bg-surface-2", o.value === value && "bg-copper-soft")}>
                <span>{o.label}</span>
                {o.sub ? <span className="font-mono text-[11px] text-mute">{o.sub}</span> : o.value === value && <Check size={14} className="text-copper" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-sm border transition-colors", on ? "border-copper bg-copper" : "border-strong bg-surface-2")}>
      <span className={cn("absolute top-0.5 h-[18px] w-[18px] rounded-[3px] transition-all", on ? "left-[22px] bg-on-copper" : "left-0.5 bg-mute")} />
    </button>
  );
}

export function Segmented<T extends string>({ value, onChange, options, className, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string; label: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn("inline-flex rounded-md border bg-surface-2 p-0.5", className)}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={cn("flex h-9 items-center justify-center gap-1.5 rounded-[6px] px-3 text-[13px] transition-all", o.value === value ? "bg-elev text-foreground shadow-card" : "text-text2 hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b">
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={o.value === value} onClick={() => onChange(o.value)}
          className={cn("relative h-11 shrink-0 px-3 text-sm transition-colors", o.value === value ? "text-foreground" : "text-mute hover:text-foreground")}>
          {o.label}
          {o.value === value && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-copper" />}
        </button>
      ))}
    </div>
  );
}

export function CopyBtn({ text, label = "Copy", icon = true, className }: { text: string; label?: string; icon?: boolean; className?: string }) {
  const [done, setDone] = useState(false);
  const go = async () => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard may be blocked in sandbox */ }
    setDone(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setDone(false), 1600);
  };
  return (
    <Btn v="secondary" s="sm" onClick={go} className={cn(done && "!border-teal !text-teal", className)} aria-live="polite">
      {done ? <Check size={14} /> : icon && <Copy size={14} />}
      {done ? "Copied" : label}
    </Btn>
  );
}

export function Modal({ open, onClose, title, desc, children, wide }: { open: boolean; onClose: () => void; title: string; desc?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0c1013]/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex max-h-[92dvh] flex-col border bg-popover shadow-overlay outline-none",
            "inset-x-0 bottom-0 rounded-t-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:w-[calc(100vw-2rem)]",
            wide ? "sm:max-w-xl" : "sm:max-w-md",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-10 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95 duration-200",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-lg font-semibold leading-tight">{title}</Dialog.Title>
              <Dialog.Description className={cn("mt-1 text-[13px] text-mute", !desc && "sr-only")}>{desc || title}</Dialog.Description>
            </div>
            <Dialog.Close className="-mr-2 -mt-1 flex h-10 w-10 items-center justify-center rounded-md text-mute hover:bg-surface-2 hover:text-foreground" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <Eyebrow className="mb-2 text-copper">{eyebrow}</Eyebrow>
        <h1 className="font-display text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[34px]">{title}</h1>
        {desc && <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text2">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const Mono = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("font-mono text-[13px] tnum break-all", className)}>{children}</span>
);

/* ---------- Illustrative QR (not scannable) ---------- */
export function QR({ seed, size = 192, className }: { seed: string; size?: number; className?: string }) {
  const N = 25;
  const path = useMemo(() => {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)), ((h >>> 0) % 1000) / 1000);
    const finder = (fx: number, fy: number) => {
      if (fx === 7 || fy === 7) return false;
      const r = Math.max(Math.abs(fx - 3), Math.abs(fy - 3));
      return r === 3 || r <= 1;
    };
    let d = "";
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const isC = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
      const f = isC ? finder(x < 8 ? x : x - (N - 8), y < 8 ? y : y - (N - 8)) : null;
      const on = f !== null ? f : rnd() > 0.52;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
    return d;
  }, [seed]);
  return (
    <div className={cn("rounded-lg border border-strong bg-[#FBF9F4] p-3", className)} style={{ width: size, maxWidth: "100%", aspectRatio: "1" }}>
      <svg viewBox={`0 0 ${N} ${N}`} className="h-full w-full" shapeRendering="crispEdges" role="img" aria-label="Illustrative QR code (prototype, not scannable)">
        <path d={path} fill="#202529" />
      </svg>
    </div>
  );
}

/* ---------- Mock data ---------- */
const hex = (seed: number, len: number) => {
  let s = seed * 9301 + 49297, out = "";
  for (let i = 0; i < len; i++) { s = (s * 9301 + 49297) % 233280; out += "0123456789abcdef"[s % 16]; }
  return out;
};
export const hash = (n: number) => "0x" + hex(n, 64);
export const addr = (n: number) => "0x" + hex(n + 100, 40);
export const short = (a: string, h = 6, t = 4) => `${a.slice(0, h)}…${a.slice(-t)}`;

export type Status = "confirmed" | "pending" | "failed";
export type Tx = { id: string; dir: "in" | "out"; amount: number; token: string; usd: number; net: string; status: Status; date: string; time: string; counterparty: string; stealth: string; hash: string; fee: string; note: string };
export const TXS: Tx[] = [
  { id: "SP-4821", dir: "in", amount: 1250, token: "USDC", usd: 1250, net: "Base", status: "confirmed", date: "12 Jun 2025", time: "14:32", counterparty: "Maren Voss", stealth: addr(1), hash: hash(1), fee: "0.00004 ETH", note: "Invoice 0417 · design retainer" },
  { id: "SP-4820", dir: "out", amount: 0.45, token: "ETH", usd: 1442.12, net: "Ethereum", status: "pending", date: "12 Jun 2025", time: "11:08", counterparty: "Ledgerline Studio", stealth: addr(2), hash: hash(2), fee: "0.00071 ETH", note: "Hosting, annual" },
  { id: "SP-4819", dir: "in", amount: 320, token: "USDT", usd: 320, net: "Arbitrum One", status: "confirmed", date: "11 Jun 2025", time: "19:47", counterparty: "Tobias Ekwueme", stealth: addr(3), hash: hash(3), fee: "0.00002 ETH", note: "Shared travel costs" },
  { id: "SP-4818", dir: "out", amount: 85, token: "USDC", usd: 85, net: "Base", status: "failed", date: "10 Jun 2025", time: "09:21", counterparty: "Okafor & Lindqvist", stealth: addr(4), hash: hash(4), fee: "—", note: "Reverted: insufficient gas" },
  { id: "SP-4817", dir: "in", amount: 2.1, token: "ETH", usd: 6730.0, net: "Ethereum", status: "confirmed", date: "09 Jun 2025", time: "16:05", counterparty: "Halden Collective", stealth: addr(5), hash: hash(5), fee: "0.00031 ETH", note: "Milestone 2 release" },
  { id: "SP-4816", dir: "out", amount: 640, token: "USDC", usd: 640, net: "Polygon", status: "confirmed", date: "07 Jun 2025", time: "13:40", counterparty: "Ines Taborda", stealth: addr(6), hash: hash(6), fee: "0.01 POL", note: "Studio rent share" },
  { id: "SP-4815", dir: "in", amount: 480, token: "USDC", usd: 480, net: "Base", status: "confirmed", date: "05 Jun 2025", time: "08:12", counterparty: "Maren Voss", stealth: addr(7), hash: hash(7), fee: "0.00003 ETH", note: "Workshop fee" },
  { id: "SP-4814", dir: "out", amount: 0.12, token: "ETH", usd: 384.56, net: "Ethereum", status: "confirmed", date: "03 Jun 2025", time: "21:55", counterparty: "Quire Print Co.", stealth: addr(8), hash: hash(8), fee: "0.00052 ETH", note: "Print run, 200 units" },
];

export type Notif = { id: number; title: string; body: string; time: string; kind: "ok" | "wait" | "bad" | "neutral"; read: boolean };
export const NOTIFS0: Notif[] = [
  { id: 1, title: "Payment received", body: "1,250.00 USDC arrived at a new stealth address on Base.", time: "12 min ago", kind: "ok", read: false },
  { id: 2, title: "Payment awaiting confirmation", body: "0.45 ETH to Ledgerline Studio has 3 of 12 confirmations.", time: "3 h ago", kind: "wait", read: false },
  { id: 3, title: "Payment failed", body: "85.00 USDC to Okafor & Lindqvist reverted. No funds were moved.", time: "2 days ago", kind: "bad", read: false },
  { id: 4, title: "New sign-in recognised", body: "Sign-in from Firefox on macOS, Lisbon. If this was not you, change your password.", time: "3 days ago", kind: "neutral", read: true },
  { id: 5, title: "Stealth identity rotated", body: "Your viewing key was last rotated 41 days ago. Rotation is recommended every 90 days.", time: "9 days ago", kind: "neutral", read: true },
];

export const META = "st:eth:0x03a91c47e2b8f60d5a1c93e7b402d8f6a15e9c3b7d204f81a6c5e0b93d72f1a84c06b2e9d7f3518a4c0e6b92d7f1a38c5e04b6d9";
export const SPEND_PUB = "0x03a91c47e2b8f60d5a1c93e7b402d8f6a15e9c3b7d204f81a6c5e0b93d72f1a84c";
export const VIEW_PUB = "0x02c06b2e9d7f3518a4c0e6b92d7f1a38c5e04b6d9f31a7c20e8b5d46913fa07e2b";
export const VIEW_PRIV = "0x7be41f09c3a85d62e0f1479ab3c8d5e2610f94a7bd3e58c2f60a19d4e7b3825c";
