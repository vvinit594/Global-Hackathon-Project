import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowDownLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, Download, Eye, EyeOff, Loader2, Search, Share2, ShieldCheck, Info, Fingerprint, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, CopyBtn, Eyebrow, Field, Input, META, Modal, Mono, PageHeader, QR, Segmented, Select, SPEND_PUB, Tabs, TXS, VIEW_PRIV, VIEW_PUB, cn, money, short, addr, hash, type Tx, type Tone } from "./ui";

export type Go = (r: string) => void;
const statusTone = (s: Tx["status"]): Tone => (s === "confirmed" ? "ok" : s === "pending" ? "wait" : "bad");

const chartData = {
  "7D": ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"].map((d, i) => ({ d, in: [320, 0, 480, 150, 1250, 0, 620][i], out: [0, 85, 0, 640, 0, 1442, 120][i] })),
  "30D": ["W1", "W2", "W3", "W4", "W5"].map((d, i) => ({ d, in: [1850, 2400, 980, 3120, 2670][i], out: [900, 1250, 1710, 640, 1790][i] })),
  "90D": ["Apr", "May", "Jun"].map((d, i) => ({ d, in: [7200, 9100, 8400][i], out: [4100, 5600, 4300][i] })),
};

function TxIcon({ t }: { t: Tx }) {
  const In = t.dir === "in";
  return <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", In ? "bg-teal-soft text-teal" : "bg-copper-soft text-copper-hover dark:text-copper")}>{In ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span>;
}
export const signed = (t: Tx) => `${t.dir === "in" ? "+" : "−"}${t.token === "ETH" ? money(t.amount, 4) : money(t.amount)}`;

/* =============== DASHBOARD =============== */
export function Dashboard({ go, openTx }: { go: Go; openTx: (t: Tx) => void }) {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");
  const [hide, setHide] = useState(false);
  return (
    <>
      <PageHeader eyebrow="Overview" title="Good afternoon, Alma" desc="Your balance, privacy posture and latest payment activity." />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card tone="feature" className="relative overflow-hidden p-6 lg:col-span-7 lg:p-8">
          <div className="flex items-center justify-between">
            <Eyebrow>Total balance · USD</Eyebrow>
            <button onClick={() => setHide(!hide)} aria-label={hide ? "Show balance" : "Hide balance"} className="flex h-9 w-9 items-center justify-center rounded-md text-mute hover:bg-surface-2">{hide ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          <p className="tnum mt-3 font-display text-[44px] font-semibold leading-none tracking-[-0.03em] sm:text-[64px]">
            {hide ? "••••••" : <>$24,022<span className="text-mute">.42</span></>}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="ok">+ $1,820.00 · 30D</Badge>
            <span className="text-mute">across 3 assets on 4 networks</span>
          </div>
          <div className="mt-7 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Btn onClick={() => go("send")}><ArrowUpRight size={17} />Send</Btn>
            <Btn v="secondary" onClick={() => go("receive")}><ArrowDownLeft size={17} />Receive</Btn>
            <Btn v="secondary" onClick={() => go("identity")}><Fingerprint size={17} />Identity</Btn>
          </div>
        </Card>

        <Card tone="panel" className="p-6 lg:col-span-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal" /><Eyebrow className="text-teal">Privacy status</Eyebrow></div>
          <p className="mt-3 font-display text-2xl font-semibold leading-tight">Identity protected</p>
          <p className="mt-1.5 text-sm leading-relaxed text-text2">Incoming payments use fresh one-time addresses. Amounts remain visible on-chain.</p>
          <dl className="mt-5 divide-y rounded-lg border bg-surface">
            {[["Stealth addresses used", "47"], ["Reused addresses", "0"], ["Viewing key age", "41 days"]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-3 text-sm"><dt className="text-text2">{k}</dt><dd className="font-mono tnum font-medium">{v}</dd></div>
            ))}
          </dl>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-12">
          {[["Received · 30D", "$11,020.00", "18 payments", "teal"], ["Sent · 30D", "$6,290.00", "11 payments", "copper"], ["Pending", "1", "0.45 ETH in flight", "warn"]].map(([k, v, s, c]) => (
            <Card key={k} className="p-5">
              <div className="flex items-center justify-between"><Eyebrow>{k}</Eyebrow><span className={cn("h-2 w-2 rounded-full", c === "teal" ? "bg-teal" : c === "copper" ? "bg-copper" : "bg-warn")} /></div>
              <p className="tnum mt-3 font-display text-3xl font-semibold tracking-tight">{v}</p>
              <p className="mt-1 text-[13px] text-mute">{s}</p>
            </Card>
          ))}
        </div>

        <Card className="p-5 lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-semibold">Payment activity</h2>
              <div className="mt-1 flex gap-4 text-xs text-mute"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-copper" />Received</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-teal" />Sent</span></div></div>
            <Segmented label="Range" value={range} onChange={setRange} options={(["7D", "30D", "90D"] as const).map((v) => ({ value: v, label: <span className="font-mono text-xs">{v}</span> }))} />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData[range]} key={range} barGap={3} margin={{ left: -12, right: 4, top: 4 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="2 4" />
                <XAxis dataKey="d" tickLine={false} axisLine={false} tick={{ fill: "var(--mute)", fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: "var(--mute)", fontSize: 11, fontFamily: "IBM Plex Mono" }} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
                <Tooltip cursor={{ fill: "var(--surface-2)", opacity: 0.6 }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "IBM Plex Mono", fontSize: 12, color: "var(--foreground)" }} formatter={(v: number, n: string) => [`$${money(v)}`, n === "in" ? "Received" : "Sent"]} />
                <Bar dataKey="in" fill="var(--copper)" radius={[3, 3, 0, 0]} animationDuration={700} />
                <Bar dataKey="out" fill="var(--teal)" radius={[3, 3, 0, 0]} animationDuration={700} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-5">
          <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-display text-lg font-semibold">Recent transactions</h2><button onClick={() => go("transactions")} className="flex items-center gap-1 text-[13px] text-copper hover:underline">View all<ArrowRight size={14} /></button></div>
          <ul className="divide-y">
            {TXS.slice(0, 5).map((t) => (
              <li key={t.id}><button onClick={() => openTx(t)} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-2/60">
                <TxIcon t={t} />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{t.counterparty}</p><p className="text-xs text-mute">{t.date} · {t.net}</p></div>
                <div className="text-right"><p className="tnum font-mono text-sm font-medium">{signed(t)} <span className="text-mute">{t.token}</span></p><div className="mt-1"><Badge tone={statusTone(t.status)}>{t.status}</Badge></div></div>
              </button></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/* =============== IDENTITY =============== */
export function Identity() {
  const [reveal, setReveal] = useState(false);
  const [rot, setRot] = useState(false);
  const hist = [["Current", "12 Jun 2025", "Active"], ["Previous", "02 Mar 2025", "Retired"], ["Initial", "14 Nov 2024", "Retired"]];
  return (
    <>
      <PageHeader eyebrow="My stealth identity" title="Meta-address" desc="Share this publicly. Senders use it to derive a fresh address for every payment." actions={<Btn v="secondary" onClick={() => toast.success("Simulated: identity export prepared")}><Download size={16} />Download</Btn>} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card tone="feature" className="p-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between"><Eyebrow>Public · safe to share</Eyebrow><Badge tone="ok">Active</Badge></div>
          <div className="rounded-lg border bg-surface-2/60 p-4"><Mono className="leading-relaxed text-foreground">{META}</Mono></div>
          <div className="mt-4 flex flex-wrap gap-2"><CopyBtn text={META} label="Copy meta-address" /><Btn v="secondary" s="sm" onClick={() => toast("Share sheet is simulated in this prototype")}><Share2 size={14} />Share</Btn></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[["Spending public key", SPEND_PUB], ["Viewing public key", VIEW_PUB]].map(([k, v]) => (
              <div key={k} className="rounded-lg border p-4"><Eyebrow>{k}</Eyebrow><Mono className="mt-2 block text-text2">{short(v, 14, 10)}</Mono><div className="mt-3"><CopyBtn text={v} /></div></div>
            ))}
          </div>
        </Card>
        <Card tone="solid" className="flex flex-col items-center p-6 lg:col-span-4">
          <Eyebrow className="self-start">Scan to pay</Eyebrow>
          <QR seed={META} size={220} className="mt-4" />
          <p className="mt-3 text-center text-xs text-mute">Illustrative code. Not scannable in the prototype.</p>
        </Card>

        <Card className="border-danger/30 p-6 lg:col-span-12">
          <div className="flex items-start gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" /><div><Eyebrow className="text-danger">Sensitive · never share</Eyebrow><h2 className="mt-1 font-display text-lg font-semibold">Viewing private key</h2><p className="mt-1 text-sm text-text2">Anyone with this key can see which payments are yours. It cannot move funds.</p></div></div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 rounded-lg border border-danger/30 bg-danger-soft/50 p-3"><Mono className={cn(!reveal && "select-none blur-[5px]")}>{VIEW_PRIV}</Mono></div>
            <div className="flex gap-2"><Btn v="secondary" onClick={() => setReveal(!reveal)}>{reveal ? <EyeOff size={16} /> : <Eye size={16} />}{reveal ? "Hide" : "Reveal"}</Btn>{reveal && <CopyBtn text={VIEW_PRIV} className="h-11" />}</div>
          </div>
        </Card>

        <Card className="lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><h2 className="font-display text-lg font-semibold">Address history</h2><Btn v="secondary" s="sm" onClick={() => setRot(true)}>Rotate keys</Btn></div>
          <ul className="divide-y">
            {hist.map(([a, b, c], i) => (
              <li key={a} className="flex flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4"><span className="w-24 text-sm font-medium">{a}</span><Mono className="flex-1 text-text2">{short(addr(40 + i), 12, 8)}</Mono><span className="font-mono text-xs text-mute">{b}</span><Badge tone={c === "Active" ? "ok" : "neutral"}>{c}</Badge></li>
            ))}
          </ul>
        </Card>
      </div>
      <Modal open={rot} onClose={() => setRot(false)} title="Rotate keys?" desc="Simulated. No keys will change in this prototype.">
        <p className="text-sm leading-relaxed text-text2">Rotating creates a new meta-address. Payments to the old one are still detected until you retire it. You will need to share the new address.</p>
        <div className="mt-5 flex justify-end gap-2"><Btn v="ghost" onClick={() => setRot(false)}>Cancel</Btn><Btn onClick={() => { setRot(false); toast.success("Simulated: keys rotated"); }}>Rotate (simulated)</Btn></div>
      </Modal>
    </>
  );
}

/* =============== RECEIVE =============== */
const TOKENS = [{ value: "USDC", label: "USDC" }, { value: "USDT", label: "USDT" }, { value: "ETH", label: "ETH" }];
const NETS = [{ value: "Base", label: "Base", sub: "8453" }, { value: "Ethereum", label: "Ethereum", sub: "1" }, { value: "Arbitrum One", label: "Arbitrum One", sub: "42161" }, { value: "Polygon", label: "Polygon", sub: "137" }];
export function Receive() {
  const [token, setToken] = useState("USDC"); const [net, setNet] = useState("Base"); const [amt, setAmt] = useState(""); const [paid, setPaid] = useState<"wait" | "seen" | "done">("wait");
  const link = `${META.slice(0, 22)}…?token=${token}&net=${net.replace(/ /g, "")}${amt ? `&amount=${amt}` : ""}`;
  const t = useRef<number[]>([]);
  useEffect(() => () => t.current.forEach(clearTimeout), []);
  const simulate = () => { setPaid("seen"); t.current.push(window.setTimeout(() => { setPaid("done"); toast.success("Simulated payment detected"); }, 1600)); };
  return (
    <>
      <PageHeader eyebrow="Receive payment" title="Request a payment" desc="Choose what you want to receive. Senders pay a fresh address derived from your meta-address." />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card tone="feature" className="order-2 p-6 lg:order-1 lg:col-span-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Token"><Select label="Token" value={token} onChange={setToken} options={TOKENS} /></Field>
            <Field label="Network"><Select label="Network" value={net} onChange={setNet} options={NETS} /></Field>
          </div>
          <div className="mt-5"><Field label="Amount (optional)" hint="Leave empty to let the sender choose."><Input inputMode="decimal" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} mono trail={<span className="px-2 font-mono text-xs text-mute">{token}</span>} /></Field></div>
          <div className="mt-6"><Eyebrow>Receiving identity</Eyebrow><div className="mt-2 rounded-lg border bg-surface-2/60 p-3"><Mono className="text-text2">{link}</Mono></div></div>
          <div className="mt-4 flex flex-wrap gap-2"><CopyBtn text={link} label="Copy request" /><Btn v="secondary" s="sm" onClick={() => toast("Share sheet is simulated in this prototype")}><Share2 size={14} />Share</Btn></div>
        </Card>
        <div className="order-1 space-y-4 lg:order-2 lg:col-span-5">
          <Card className="flex flex-col items-center p-6">
            <QR seed={link} size={230} />
            <p className="tnum mt-4 font-mono text-sm">{amt ? `${amt} ${token}` : `Any amount · ${token}`}</p>
            <p className="font-mono text-xs text-mute">{net}</p>
          </Card>
          <Card tone="panel" className="p-5">
            <div className="flex items-center justify-between"><Eyebrow>Payment status</Eyebrow>
              <Badge tone={paid === "done" ? "ok" : paid === "seen" ? "wait" : "neutral"}>{paid === "done" ? "Received" : paid === "seen" ? "Detecting" : "Waiting"}</Badge></div>
            <p className="mt-3 flex items-center gap-2 text-sm text-text2">{paid === "seen" && <Loader2 size={16} className="animate-spin text-copper" />}{paid === "done" && <CheckCircle2 size={16} className="text-teal" />}
              {paid === "wait" ? "Listening for payments to your meta-address." : paid === "seen" ? "Scanning with your viewing key…" : "A payment arrived at a new one-time address."}</p>
            <div className="mt-4 flex gap-2">
              {paid === "wait" && <Btn v="secondary" s="sm" onClick={simulate}>Simulate incoming payment</Btn>}
              {paid === "done" && <Btn v="secondary" s="sm" onClick={() => setPaid("wait")}>Reset</Btn>}
            </div>
            <p className="mt-3 text-[11px] text-mute">Simulation only. No on-chain activity.</p>
          </Card>
        </div>
      </div>
    </>
  );
}

/* =============== SEND =============== */
type Stage = "idle" | "review" | "processing" | "success" | "error";
const STEPS = ["Deriving one-time address", "Signing transaction", "Broadcasting to network"];
export function Send({ go }: { go: Go }) {
  const [to, setTo] = useState(""); const [amt, setAmt] = useState(""); const [token, setToken] = useState("USDC"); const [net, setNet] = useState("Base");
  const [touched, setTouched] = useState(false); const [stage, setStage] = useState<Stage>("idle"); const [step, setStep] = useState(0); const [fail, setFail] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const bal: Record<string, number> = { USDC: 9120.5, USDT: 1500, ETH: 4.182 };
  const validTo = /^st:eth:0x[0-9a-fA-F]{20,}/.test(to) || /^[a-z0-9-]+\.stealth$/.test(to);
  const n = parseFloat(amt);
  const toErr = touched && !validTo ? "Enter a meta-address (st:eth:0x…) or a name ending in .stealth." : undefined;
  const aErr = touched ? (!n || n <= 0 ? "Enter an amount greater than zero." : n > bal[token] ? `Exceeds available ${token} balance.` : undefined) : undefined;
  const oneTime = validTo ? addr(77) : "";
  const fee = net === "Ethereum" ? "0.00071 ETH" : net === "Polygon" ? "0.01 POL" : "0.00004 ETH";
  const review = () => { setTouched(true); if (validTo && n > 0 && n <= bal[token]) setStage("review"); };
  const run = () => {
    setStage("processing"); setStep(0);
    [900, 1800, 2700].forEach((ms, i) => timers.current.push(window.setTimeout(() => { if (i < 2) setStep(i + 1); else setStage(fail ? "error" : "success"); }, ms)));
  };
  const close = () => { if (stage === "processing") return; timers.current.forEach(clearTimeout); if (stage === "success") { setTo(""); setAmt(""); setTouched(false); } setStage("idle"); };
  return (
    <>
      <PageHeader eyebrow="Send payment" title="Send privately" desc="Pay a meta-address. A one-time destination is derived for this payment only." />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card tone="feature" className="space-y-5 p-6 lg:col-span-7">
          <Field label="Recipient" error={toErr} hint="Meta-address or .stealth name" right={<button onClick={() => setTo("st:eth:0x02f7a3c91b4e6d08a5c2f931e7b60d48a1c5e9f3b72d6048c1a9e5f30b7d24a86c")} className="text-[13px] text-copper hover:underline">Use sample</button>}>
            <Input mono placeholder="st:eth:0x… or name.stealth" value={to} onChange={(e) => setTo(e.target.value.trim())} invalid={!!toErr} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
            <Field label="Amount" error={aErr} right={<button onClick={() => setAmt(String(bal[token]))} className="font-mono text-xs text-copper hover:underline">Max {token === "ETH" ? bal.ETH : money(bal[token])}</button>}>
              <Input mono inputMode="decimal" placeholder="0.00" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} invalid={!!aErr} />
            </Field>
            <Field label="Token"><Select label="Token" value={token} onChange={setToken} options={TOKENS} /></Field>
          </div>
          <Field label="Network"><Select label="Network" value={net} onChange={setNet} options={NETS} /></Field>
          <label className="flex cursor-pointer items-center gap-3 text-sm text-text2"><input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} className="h-4 w-4 accent-[var(--copper)]" />Prototype: simulate a failed payment</label>
          <Btn s="lg" className="w-full" onClick={review}>Review payment <ArrowRight size={18} /></Btn>
        </Card>
        <div className="space-y-4 lg:col-span-5">
          <Card tone="panel" className="p-5">
            <Eyebrow>Address preview</Eyebrow>
            {validTo ? (
              <div className="mt-3 space-y-3 animate-in fade-in-0 duration-300">
                <div><p className="text-xs text-mute">One-time destination</p><Mono className="text-foreground">{oneTime}</Mono></div>
                <div className="flex items-center gap-2 text-xs text-teal"><Check size={14} />Not linked to the recipient’s meta-address on-chain</div>
              </div>
            ) : <p className="mt-3 text-sm text-mute">Enter a valid recipient to preview the derived address.</p>}
          </Card>
          <Card className="divide-y">
            {[["Available", token === "ETH" ? `${bal.ETH} ETH` : `${money(bal[token])} ${token}`], ["Network", net], ["Estimated fee", fee]].map(([k, v]) => (
              <div key={k} className="flex justify-between px-5 py-3.5 text-sm"><span className="text-text2">{k}</span><span className="tnum font-mono">{v}</span></div>
            ))}
          </Card>
          <p className="flex gap-2 rounded-lg border bg-surface-2/60 p-3 text-xs leading-relaxed text-mute"><Info size={15} className="mt-px shrink-0" />Prototype only. Confirming does not broadcast a blockchain transaction.</p>
        </div>
      </div>

      <Modal open={stage !== "idle"} onClose={close} title={stage === "review" ? "Confirm payment" : stage === "processing" ? "Sending…" : stage === "success" ? "Payment sent" : "Payment failed"} desc="Simulated payment. No real funds move.">
        {stage === "review" && (
          <div>
            <p className="tnum font-display text-4xl font-semibold tracking-tight">{amt} <span className="text-mute">{token}</span></p>
            <dl className="mt-5 divide-y rounded-lg border text-sm">
              {[["To", short(to, 14, 6)], ["Derived address", short(oneTime, 10, 6)], ["Network", net], ["Fee", fee]].map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-text2">{k}</dt><dd className="font-mono text-[13px]">{v}</dd></div>)}
            </dl>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Btn v="ghost" onClick={close}>Edit</Btn><Btn onClick={run}>Confirm (simulated)</Btn></div>
          </div>
        )}
        {stage === "processing" && (
          <ul className="space-y-4 py-2">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-3 text-sm", i > step ? "text-mute" : "text-foreground")}>
                <span className="flex h-6 w-6 items-center justify-center">{i < step ? <Check size={18} className="text-teal" /> : i === step ? <Loader2 size={18} className="animate-spin text-copper" /> : <span className="h-2 w-2 rounded-full bg-strong" />}</span>{s}
              </li>
            ))}
          </ul>
        )}
        {stage === "success" && (
          <div className="animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-soft text-teal"><CheckCircle2 size={26} /></div>
            <p className="mt-4 text-[15px] text-text2"><span className="tnum font-mono text-foreground">{amt} {token}</span> sent to a one-time address on {net}.</p>
            <Mono className="mt-3 block text-mute">{short(hash(99), 14, 8)}</Mono>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end"><Btn v="ghost" onClick={close}>Send another</Btn><Btn onClick={() => { close(); go("transactions"); }}>View transactions</Btn></div>
          </div>
        )}
        {stage === "error" && (
          <div className="animate-in fade-in-0 duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-danger-soft text-danger"><AlertTriangle size={24} /></div>
            <p className="mt-4 text-[15px] text-text2">Simulated RPC timeout on {net}. No funds were moved and no fee was charged.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end"><Btn v="ghost" onClick={close}>Cancel</Btn><Btn onClick={run}>Retry</Btn></div>
          </div>
        )}
      </Modal>
    </>
  );
}

/* =============== TRANSACTIONS =============== */
export function Transactions({ openTx }: { openTx: (t: Tx) => void }) {
  const [q, setQ] = useState(""); const [dir, setDir] = useState<"all" | "in" | "out">("all"); const [st, setSt] = useState("all"); const [tok, setTok] = useState("all");
  const list = TXS.filter((t) => (dir === "all" || t.dir === dir) && (st === "all" || t.status === st) && (tok === "all" || t.token === tok) && (`${t.id} ${t.counterparty} ${t.note} ${t.hash} ${t.token}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <PageHeader eyebrow="Transactions" title="Payment history" desc="Every payment sent or detected by your viewing key." />
      <Card className="mb-4 flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex-1"><Input lead={<Search size={16} />} placeholder="Search by name, note, ID or hash" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search transactions" /></div>
        <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: "all", label: "All" }, { value: "in", label: "Received" }, { value: "out", label: "Sent" }]} />
        <div className="grid grid-cols-2 gap-2 lg:w-[300px]">
          <Select label="Status" value={st} onChange={setSt} options={[{ value: "all", label: "Any status" }, { value: "confirmed", label: "Confirmed" }, { value: "pending", label: "Pending" }, { value: "failed", label: "Failed" }]} />
          <Select label="Token" value={tok} onChange={setTok} options={[{ value: "all", label: "Any token" }, ...TOKENS]} />
        </div>
      </Card>
      {list.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center"><Search className="text-mute" /><p className="mt-3 font-display text-lg font-semibold">No matching transactions</p><p className="mt-1 text-sm text-mute">Adjust your search or filters.</p><Btn v="secondary" s="sm" className="mt-4" onClick={() => { setQ(""); setDir("all"); setSt("all"); setTok("all"); }}>Clear filters</Btn></Card>
      ) : (
        <>
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-surface-2/60 text-left">{["Counterparty", "Network", "Date", "Status", "Amount"].map((h, i) => <th key={h} className={cn("px-5 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-mute", i === 4 && "text-right")}>{h}</th>)}</tr></thead>
              <tbody className="divide-y">
                {list.map((t) => (
                  <tr key={t.id} onClick={() => openTx(t)} className="cursor-pointer hover:bg-surface-2/50">
                    <td className="px-5 py-3.5"><div className="flex items-center gap-3"><TxIcon t={t} /><div><p className="font-medium">{t.counterparty}</p><p className="font-mono text-xs text-mute">{t.id}</p></div></div></td>
                    <td className="px-5 py-3.5 text-text2">{t.net}</td>
                    <td className="px-5 py-3.5"><p>{t.date}</p><p className="font-mono text-xs text-mute">{t.time}</p></td>
                    <td className="px-5 py-3.5"><Badge tone={statusTone(t.status)}>{t.status}</Badge></td>
                    <td className="px-5 py-3.5 text-right"><p className="tnum font-mono font-medium">{signed(t)} {t.token}</p><p className="tnum font-mono text-xs text-mute">${money(t.usd)}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <ul className="space-y-2 md:hidden">
            {list.map((t) => (
              <li key={t.id}><button onClick={() => openTx(t)} className="w-full rounded-lg border bg-surface p-4 text-left shadow-card active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><TxIcon t={t} /><div className="min-w-0"><p className="truncate font-medium">{t.counterparty}</p><p className="text-xs text-mute">{t.date} · {t.net}</p></div></div>
                  <div className="text-right"><p className="tnum font-mono text-[15px] font-medium">{signed(t)}</p><p className="font-mono text-xs text-mute">{t.token}</p></div></div>
                <div className="mt-3 flex items-center justify-between"><Badge tone={statusTone(t.status)}>{t.status}</Badge><span className="tnum font-mono text-xs text-mute">${money(t.usd)}</span></div>
              </button></li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

export function TxModal({ tx, onClose }: { tx: Tx | null; onClose: () => void }) {
  const t = tx;
  return (
    <Modal open={!!t} onClose={onClose} wide title={t ? `${t.dir === "in" ? "Received" : "Sent"} · ${t.id}` : ""} desc="Transaction details">
      {t && (
        <div>
          <div className="flex items-end justify-between gap-4"><p className="tnum font-display text-4xl font-semibold tracking-tight">{signed(t)} <span className="text-mute">{t.token}</span></p><Badge tone={statusTone(t.status)}>{t.status}</Badge></div>
          <p className="tnum mt-1 font-mono text-sm text-mute">≈ ${money(t.usd)} USD</p>
          <dl className="mt-5 divide-y rounded-lg border text-sm">
            {[["Counterparty", t.counterparty], ["Network", t.net], ["Date", `${t.date} · ${t.time}`], ["Network fee", t.fee], ["Note", t.note]].map(([k, v]) => <div key={k} className="flex justify-between gap-6 px-4 py-3"><dt className="shrink-0 text-text2">{k}</dt><dd className="text-right">{v}</dd></div>)}
            <div className="px-4 py-3"><dt className="text-text2">Stealth address</dt><dd className="mt-1"><Mono>{t.stealth}</Mono></dd></div>
            <div className="px-4 py-3"><dt className="text-text2">Transaction hash</dt><dd className="mt-1"><Mono>{t.hash}</Mono></dd></div>
          </dl>
          <div className="mt-5 flex gap-2"><CopyBtn text={t.hash} label="Copy hash" /><CopyBtn text={t.stealth} label="Copy address" /></div>
        </div>
      )}
    </Modal>
  );
}
