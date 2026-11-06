import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2, MailCheck, Moon, Sun, KeyRound, Activity, Layers, X, ArrowLeft } from "lucide-react";
import { Brand, Btn, Card, Eyebrow, Field, Input, Logo, Mono, Wordmark, cn, addr } from "./ui";

export type Go = (r: string) => void;
type ThemeProps = { dark: boolean; toggle: () => void };

/* =============== LANDING =============== */
function ShieldSpecimen() {
  return (
    <div className="relative aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full text-mute" fill="none" stroke="currentColor" strokeWidth="0.75">
        <rect x="0.5" y="0.5" width="399" height="399" rx="20" className="stroke-border" />
        {[80, 160, 240, 320].map((p) => (<g key={p}><line x1={p} y1="0" x2={p} y2="400" className="stroke-border" /><line x1="0" y1={p} x2="400" y2={p} className="stroke-border" /></g>))}
        <line x1="200" y1="28" x2="200" y2="372" strokeDasharray="3 4" className="stroke-copper" />
        <circle cx="200" cy="170" r="118" strokeDasharray="2 5" />
        <path d="M60 372h280M60 366v12M340 366v12" className="stroke-strong" />
      </svg>
      <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"><Logo size={250} className="max-w-[56vw]" /></div>
      <span className="absolute bottom-3 left-5 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">FIG.01 — Shield, 32 × 32 grid</span>
      <span className="absolute right-5 top-4 font-mono text-[10px] uppercase tracking-[0.16em] text-copper">Ø 1:1.618</span>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="relative border-t pt-5">
      <span className="font-mono text-xs text-copper">{n}</span>
      <h3 className="mt-3 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-text2">{body}</p>
    </div>
  );
}

export function Landing({ go, dark, toggle }: { go: Go } & ThemeProps) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b bg-glass backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-8">
          <Brand onClick={() => go("landing")} />
          <nav className="hidden items-center gap-7 text-sm text-text2 md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Capabilities</a>
            <a href="#privacy" className="hover:text-foreground">Privacy model</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <button onClick={toggle} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-md text-text2 hover:bg-surface-2">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Btn v="ghost" s="sm" className="hidden sm:inline-flex" onClick={() => go("login")}>Sign in</Btn>
            <Btn s="sm" onClick={() => go("register")}>Create identity</Btn>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-24 lg:pt-20">
        <div>
          <Eyebrow className="mb-6 flex items-center gap-3 text-copper"><span className="h-px w-8 bg-copper" />Forge / Signal · Private payments</Eyebrow>
          <h1 className="font-display text-[44px] font-semibold leading-[0.98] tracking-[-0.03em] sm:text-[68px] lg:text-[84px]">
            Engineered<br />privacy.<br /><span className="text-copper">Clear financial</span><br />control.
          </h1>
          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-text2">
            Stealth Pay gives you one public meta-address. Every payment to it lands at a fresh one-time address that only you can recognise, so your balance and your counterparties stay yours.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Btn s="lg" onClick={() => go("register")}>Create your stealth identity <ArrowRight size={18} /></Btn>
            <Btn s="lg" v="secondary" onClick={() => go("dashboard")}>Explore the prototype</Btn>
          </div>
          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t pt-6">
            {[["1", "public meta-address"], ["0", "reused addresses"], ["4", "supported networks"]].map(([a, b]) => (
              <div key={b}><dt className="font-display text-3xl font-semibold tnum">{a}</dt><dd className="mt-1 text-[13px] leading-snug text-mute">{b}</dd></div>
            ))}
          </dl>
        </div>
        <div className="flex justify-center lg:justify-end"><ShieldSpecimen /></div>
      </section>

      <section id="how" className="border-y bg-surface">
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
            <div><Eyebrow className="text-copper">01 — Mechanism</Eyebrow><h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">Three steps between a payment and your wallet.</h2></div>
            <div className="grid gap-8 sm:grid-cols-3">
              <Step n="01" title="Publish once" body="Share your meta-address on an invoice, profile or QR code. It contains public keys only." />
              <Step n="02" title="Sender derives" body="The sender computes a one-time stealth address from your keys and pays it directly on-chain." />
              <Step n="03" title="You detect" body="Your viewing key scans for payments addressed to you. Spending stays behind your own key." />
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1240px] px-4 py-16 sm:px-8 lg:py-24">
        <Eyebrow className="text-copper">02 — Capabilities</Eyebrow>
        <h2 className="mb-10 mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight">Everything you need to receive and send privately.</h2>
        <div className="grid gap-4 lg:grid-cols-6">
          <Card tone="feature" className="p-6 lg:col-span-3 lg:row-span-2 lg:p-8">
            <KeyRound className="text-copper" size={22} />
            <h3 className="mt-5 font-display text-2xl font-semibold">Stealth identity</h3>
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-text2">One reusable meta-address with separate spending and viewing keys. Rotate, export and review its history at any time.</p>
            <div className="mt-8 rounded-lg border bg-surface-2/60 p-4">
              <Eyebrow>Meta-address</Eyebrow>
              <Mono className="mt-2 block text-text2">st:eth:0x03a91c47e2b8f60d5a1c93e7b402…</Mono>
              <div className="mt-4 flex items-center gap-2 text-xs text-mute"><ArrowRight size={14} className="rotate-90 text-copper" />derives per payment</div>
              <Mono className="mt-2 block text-foreground">{addr(11).slice(0, 30)}…</Mono>
            </div>
          </Card>
          <Card className="p-6 lg:col-span-3"><Layers className="text-teal" size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Multi-network</h3><p className="mt-2 text-[15px] leading-relaxed text-text2">Receive and send ETH, USDC and USDT across Ethereum, Base, Arbitrum One and Polygon from one identity.</p></Card>
          <Card className="p-6 lg:col-span-3"><Activity className="text-teal" size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Clear status, always</h3><p className="mt-2 text-[15px] leading-relaxed text-text2">Pending, confirmed or failed. Every payment shows its network, fee and hash in plain view.</p></Card>
        </div>
      </section>

      <section id="privacy" className="bg-[#14191D] text-[#E9E7DF]">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <Eyebrow className="text-[#E0785C]">03 — Privacy model</Eyebrow>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">What is hidden, and what is not.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#C1C6C4]">Stealth addresses unlink payments from your public identity. They do not hide amounts or make a network transaction disappear. We state the limits plainly.</p>
          </div>
          <div className="divide-y divide-[#354148] rounded-xl border border-[#354148] bg-[#1E262B]">
            {[["Hidden", "Link between your meta-address and the receiving address", "ok"], ["Hidden", "Which payments belong to you, without your viewing key", "ok"], ["Visible", "Amount, token and network of each on-chain transfer", "no"], ["Yours alone", "Spending key. It never leaves your device", "ok"]].map(([k, v, t]) => (
              <div key={v} className="flex items-start gap-4 p-4">
                <span className={cn("mt-0.5 w-24 shrink-0 font-mono text-[11px] uppercase tracking-wider", t === "ok" ? "text-[#72B7A9]" : "text-[#E0B15C]")}>{k}</span>
                <span className="text-[15px] text-[#E9E7DF]">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-8 lg:py-24">
        <Card tone="feature" className="flex flex-col items-start justify-between gap-6 p-7 sm:p-10 md:flex-row md:items-center">
          <div><h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Create your meta-address in under a minute.</h2><p className="mt-2 text-text2">This is a design prototype. Nothing you do here moves real funds.</p></div>
          <Btn s="lg" onClick={() => go("register")} className="shrink-0">Get started <ArrowRight size={18} /></Btn>
        </Card>
      </section>

      <footer className="border-t bg-surface">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5"><Logo size={26} /><Wordmark /></div>
          <p className="max-w-md text-xs leading-relaxed text-mute">Prototype interface. Balances, addresses and transactions are simulated. © 2025 Stealth Pay — FORGE / SIGNAL design system.</p>
          <div className="flex gap-5 text-sm text-text2"><button onClick={() => go("login")}>Sign in</button><button onClick={() => go("register")}>Register</button></div>
        </div>
      </footer>
    </div>
  );
}

/* =============== AUTH =============== */
function AuthShell({ go, children, quote }: { go: Go; children: ReactNode; quote: string }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#14191D] p-10 text-[#E9E7DF] lg:flex">
        <div className="flex items-center gap-2.5"><Logo size={30} /><Wordmark /></div>
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-[#354148]" fill="none" stroke="currentColor" strokeWidth="0.75"><defs><pattern id="g" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" opacity="0.5" /></svg>
        <div className="relative max-w-sm">
          <Eyebrow className="mb-4 text-[#E0785C]">Engineered privacy</Eyebrow>
          <p className="font-display text-3xl font-medium leading-tight tracking-tight">{quote}</p>
        </div>
        <Mono className="relative text-[#A8B0B2]">FORGE / SIGNAL · v1.0 · prototype</Mono>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden"><Brand onClick={() => go("landing")} /></div>
          <button onClick={() => go("landing")} className="ml-auto flex h-10 items-center gap-1.5 text-sm text-text2 hover:text-foreground"><ArrowLeft size={16} />Back to site</button>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const PwToggle = ({ show, set }: { show: boolean; set: (b: boolean) => void }) => (
  <button type="button" onClick={() => set(!show)} aria-label={show ? "Hide password" : "Show password"} className="flex h-9 w-9 items-center justify-center rounded-sm text-mute hover:bg-surface-2 hover:text-foreground">
    {show ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
);

export function Login({ go }: { go: Go }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false); const [busy, setBusy] = useState(false);
  const eErr = touched && !emailOk(email) ? "Enter a valid email address." : undefined;
  const pErr = touched && pw.length < 1 ? "Enter your password." : undefined;
  const submit = (e: FormEvent) => {
    e.preventDefault(); setTouched(true);
    if (!emailOk(email) || !pw) return;
    setBusy(true); setTimeout(() => go("dashboard"), 900);
  };
  return (
    <AuthShell go={go} quote="Your address is public. Your payments don't have to be.">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-8 mt-2 text-text2">Sign in to your stealth identity.</p>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Email" error={eErr}><Input type="email" autoComplete="email" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!eErr} /></Field>
        <Field label="Password" error={pErr} right={<button type="button" onClick={() => go("forgot")} className="text-[13px] text-copper hover:underline">Forgot password?</button>}>
          <Input type={show ? "text" : "password"} autoComplete="current-password" placeholder="••••••••••" value={pw} onChange={(e) => setPw(e.target.value)} invalid={!!pErr} trail={<PwToggle show={show} set={setShow} />} />
        </Field>
        <Btn type="submit" s="lg" className="w-full" disabled={busy}>{busy ? <><Loader2 size={18} className="animate-spin" />Signing in…</> : "Sign in"}</Btn>
      </form>
      <p className="mt-6 text-center text-sm text-text2">New to Stealth Pay? <button onClick={() => go("register")} className="font-medium text-copper hover:underline">Create an identity</button></p>
      <p className="mt-8 rounded-md border bg-surface-2/60 p-3 text-xs leading-relaxed text-mute">Prototype: any valid email and password will sign you in. No account is created.</p>
    </AuthShell>
  );
}

export function Register({ go }: { go: Go }) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false); const [terms, setTerms] = useState(false); const [touched, setTouched] = useState(false); const [busy, setBusy] = useState(false);
  const rules = [["At least 12 characters", pw.length >= 12], ["Upper and lower case letters", /[a-z]/.test(pw) && /[A-Z]/.test(pw)], ["A number", /\d/.test(pw)], ["A symbol", /[^A-Za-z0-9]/.test(pw)]] as const;
  const strong = rules.every((r) => r[1]);
  const eErr = touched && !emailOk(email) ? "Enter a valid email address." : undefined;
  const mErr = touched && pw2 !== pw ? "Passwords do not match." : undefined;
  const submit = (e: FormEvent) => {
    e.preventDefault(); setTouched(true);
    if (!emailOk(email) || !strong || pw !== pw2 || !terms) return;
    setBusy(true); setTimeout(() => go("dashboard"), 1000);
  };
  return (
    <AuthShell go={go} quote="One meta-address. Unlimited one-time destinations.">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Create your identity</h1>
      <p className="mb-8 mt-2 text-text2">Set up access to your stealth meta-address.</p>
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Email" error={eErr}><Input type="email" autoComplete="email" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!eErr} /></Field>
        <Field label="Password">
          <Input type={show ? "text" : "password"} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} trail={<PwToggle show={show} set={setShow} />} invalid={touched && !strong} />
          <ul className="grid gap-1.5 pt-2 sm:grid-cols-2">
            {rules.map(([t, ok]) => (
              <li key={t} className={cn("flex items-center gap-2 text-xs", ok ? "text-teal" : touched ? "text-danger" : "text-mute")}>
                <span className={cn("flex h-4 w-4 items-center justify-center rounded-[3px] border", ok ? "border-teal bg-teal-soft" : "border-strong")}>{ok ? <Check size={11} /> : touched ? <X size={11} /> : null}</span>{t}
              </li>
            ))}
          </ul>
        </Field>
        <Field label="Confirm password" error={mErr}><Input type={show ? "text" : "password"} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} invalid={!!mErr} /></Field>
        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-text2">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--copper)]" />
            I understand that Stealth Pay never holds my keys and I accept the Terms and Privacy Policy.
          </label>
          {touched && !terms && <p role="alert" className="mt-1.5 text-xs text-danger">Accept the terms to continue.</p>}
        </div>
        <Btn type="submit" s="lg" className="w-full" disabled={busy}>{busy ? <><Loader2 size={18} className="animate-spin" />Generating keys…</> : "Create identity"}</Btn>
      </form>
      <p className="mt-6 text-center text-sm text-text2">Already registered? <button onClick={() => go("login")} className="font-medium text-copper hover:underline">Sign in</button></p>
    </AuthShell>
  );
}

export function Forgot({ go }: { go: Go }) {
  const [email, setEmail] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) return setErr("Enter a valid email address.");
    setErr(""); setBusy(true); setTimeout(() => { setBusy(false); setSent(true); }, 900);
  };
  return (
    <AuthShell go={go} quote="Recovery restores access. It never exposes your keys.">
      {sent ? (
        <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-teal-soft text-teal"><MailCheck size={26} /></div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Check your inbox</h1>
          <p className="mb-8 mt-2 text-text2">If an account exists for <Mono className="text-foreground">{email}</Mono>, a reset link is on its way. It expires in 30 minutes.</p>
          <Btn s="lg" className="w-full" onClick={() => go("login")}>Return to sign in</Btn>
          <button onClick={() => setSent(false)} className="mt-4 w-full text-center text-sm text-copper hover:underline">Use a different email</button>
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Reset password</h1>
          <p className="mb-8 mt-2 text-text2">Enter your email and we will send a reset link. Your stealth keys are unaffected.</p>
          <form onSubmit={submit} noValidate className="space-y-5">
            <Field label="Email" error={err}><Input type="email" placeholder="you@studio.com" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!err} /></Field>
            <Btn type="submit" s="lg" className="w-full" disabled={busy}>{busy ? <><Loader2 size={18} className="animate-spin" />Sending…</> : "Send reset link"}</Btn>
          </form>
          <button onClick={() => go("login")} className="mt-6 flex w-full items-center justify-center gap-1.5 text-sm text-text2 hover:text-foreground"><ArrowLeft size={15} />Back to sign in</button>
        </>
      )}
    </AuthShell>
  );
}
