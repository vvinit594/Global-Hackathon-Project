import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, BellOff, Check, CheckCircle2, Clock, AlertTriangle, Info, Monitor, Moon, Sun, Power } from "lucide-react";
import { toast } from "sonner";
import { Badge, Btn, Card, CopyBtn, Eyebrow, Field, Input, Mono, PageHeader, Segmented, Select, Switch, Tabs, cn, money, addr, type Notif } from "./ui";
import type { Go } from "./pages1";

export type ThemePref = "light" | "dark" | "system";

/* =============== WALLET =============== */
const ASSETS = [
  { sym: "ETH", name: "Ether", bal: "4.1820", usd: 13401.92, px: "3,204.70", chg: "+1.8%" },
  { sym: "USDC", name: "USD Coin", bal: "9,120.50", usd: 9120.5, px: "1.00", chg: "0.0%" },
  { sym: "USDT", name: "Tether", bal: "1,500.00", usd: 1500, px: "1.00", chg: "0.0%" },
];
const NETWORKS = ["All", "Ethereum", "Base", "Arbitrum One", "Polygon"];
export function Wallet({ go }: { go: Go }) {
  const [net, setNet] = useState("All");
  const [conn, setConn] = useState(true);
  return (
    <>
      <PageHeader eyebrow="Wallet" title="Assets & connection" desc="Balances held by your connected wallet across supported networks." actions={<><Btn onClick={() => go("send")}><ArrowUpRight size={16} />Send</Btn><Btn v="secondary" onClick={() => go("receive")}><ArrowDownLeft size={16} />Receive</Btn></>} />
      <div className="grid gap-4 lg:grid-cols-12">
        <Card tone="feature" className="p-6 lg:col-span-7">
          <Eyebrow>Wallet balance</Eyebrow>
          <p className="tnum mt-3 font-display text-5xl font-semibold tracking-[-0.03em]">$24,022<span className="text-mute">.42</span></p>
          <div className="mt-6"><Eyebrow className="mb-2">Network</Eyebrow>
            <div className="-mx-1 flex flex-wrap gap-1.5 px-1">{NETWORKS.map((n) => <button key={n} onClick={() => setNet(n)} aria-pressed={n === net} className={cn("h-9 rounded-sm border px-3 text-[13px] transition-colors", n === net ? "border-copper bg-copper-soft text-copper-hover dark:text-copper" : "bg-elev text-text2 hover:bg-surface-2")}>{n}</button>)}</div></div>
        </Card>
        <Card tone="panel" className="p-6 lg:col-span-5">
          <div className="flex items-center justify-between"><Eyebrow>Connected wallet</Eyebrow><Badge tone={conn ? "ok" : "neutral"}>{conn ? "Connected" : "Disconnected"}</Badge></div>
          <p className="mt-3 font-display text-xl font-semibold">Browser wallet</p>
          <Mono className="mt-1 block text-text2">{addr(300)}</Mono>
          <div className="mt-4 flex flex-wrap gap-2"><CopyBtn text={addr(300)} />
            <Btn v={conn ? "danger" : "secondary"} s="sm" onClick={() => { setConn(!conn); toast(conn ? "Simulated: wallet disconnected" : "Simulated: wallet connected"); }}><Power size={14} />{conn ? "Disconnect" : "Connect"}</Btn></div>
        </Card>
        <Card className="lg:col-span-12">
          <div className="border-b px-5 py-4"><h2 className="font-display text-lg font-semibold">Assets</h2></div>
          <ul className="divide-y">
            {ASSETS.map((a) => (
              <li key={a.sym} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border bg-elev font-mono text-[11px] font-semibold">{a.sym}</span>
                <div className="min-w-0 flex-1"><p className="font-medium">{a.name}</p><p className="tnum font-mono text-xs text-mute">${a.px} · {a.chg}</p></div>
                <div className="text-right"><p className="tnum font-mono font-medium">{a.bal} <span className="text-mute">{a.sym}</span></p><p className="tnum font-mono text-xs text-mute">${money(a.usd)}</p></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

/* =============== NOTIFICATIONS =============== */
const KIND = { ok: [CheckCircle2, "bg-teal-soft text-teal"], wait: [Clock, "bg-warn-soft text-warn-text"], bad: [AlertTriangle, "bg-danger-soft text-danger"], neutral: [Info, "bg-surface-2 text-text2"] } as const;
export function Notifications({ items, setItems }: { items: Notif[]; setItems: (n: Notif[]) => void }) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => !n.read).length;
  const list = tab === "all" ? items : items.filter((n) => !n.read);
  return (
    <>
      <PageHeader eyebrow="Notifications" title="Activity alerts" desc={unread ? `${unread} unread` : "You are all caught up."} actions={<><Btn v="secondary" disabled={!unread} onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}><Check size={16} />Mark all read</Btn><Btn v="ghost" disabled={!items.length} onClick={() => setItems([])}>Clear all</Btn></>} />
      <Tabs label="Filter" value={tab} onChange={setTab} options={[{ value: "all", label: `All (${items.length})` }, { value: "unread", label: `Unread (${unread})` }]} />
      {list.length === 0 ? (
        <Card tone="panel" className="mt-5 flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-mute"><BellOff size={22} /></span>
          <p className="mt-4 font-display text-xl font-semibold">{items.length ? "No unread notifications" : "Nothing here yet"}</p>
          <p className="mt-1 max-w-xs text-sm text-mute">Payment confirmations, failures and security events will appear here.</p>
        </Card>
      ) : (
        <ul className="mt-5 space-y-2.5">
          {list.map((n) => { const [Ico, c] = KIND[n.kind]; return (
            <li key={n.id}><button onClick={() => setItems(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className={cn("flex w-full gap-4 rounded-lg border p-4 text-left transition-colors", n.read ? "bg-surface/60" : "bg-surface shadow-card hover:bg-elev")}>
              <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", c)}><Ico size={19} /></span>
              <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className={cn("text-[15px]", n.read ? "font-normal text-text2" : "font-medium")}>{n.title}</p>{!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-copper" aria-label="Unread" />}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-text2">{n.body}</p><p className="mt-2 font-mono text-[11px] text-mute">{n.time}</p></div>
            </button></li>
          ); })}
        </ul>
      )}
    </>
  );
}

/* =============== SETTINGS =============== */
function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-6 py-4"><div className="min-w-0"><p className="text-[15px] font-medium">{title}</p>{desc && <p className="mt-0.5 text-sm text-mute">{desc}</p>}</div><div className="shrink-0">{children}</div></div>;
}
export function Settings({ pref, setPref }: { pref: ThemePref; setPref: (t: ThemePref) => void }) {
  const [tab, setTab] = useState<"profile" | "security" | "wallet" | "prefs">("profile");
  const [name, setName] = useState("Alma Reyes"); const [email, setEmail] = useState("alma@reyes.studio");
  const [two, setTwo] = useState(true); const [lock, setLock] = useState(true);
  const [def, setDef] = useState("Base"); const [cur, setCur] = useState("USD");
  const [n, setN] = useState({ rec: true, sent: true, fail: true, sec: true });
  const nrows: [keyof typeof n, string, string][] = [["rec", "Payment received", "When your viewing key detects a payment"], ["sent", "Payment confirmed", "When a sent payment reaches finality"], ["fail", "Payment failed", "When a transaction reverts or times out"], ["sec", "Security events", "New sign-ins and key rotation reminders"]];
  return (
    <>
      <PageHeader eyebrow="Settings" title="Account & preferences" />
      <Tabs label="Settings sections" value={tab} onChange={setTab} options={[{ value: "profile", label: "Profile" }, { value: "security", label: "Security" }, { value: "wallet", label: "Wallet" }, { value: "prefs", label: "Preferences" }]} />
      <div className="mt-6 grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8" key={tab}>
          {tab === "profile" && (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-5 p-6">
              <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-lg bg-copper font-display text-xl font-semibold text-on-copper">AR</span><div><p className="font-display text-lg font-semibold">{name}</p><p className="text-sm text-mute">Member since Nov 2024</p></div></div>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Display name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field><Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
              <Btn onClick={() => toast.success("Profile saved (simulated)")}>Save changes</Btn>
            </Card>
          )}
          {tab === "security" && (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-1 divide-y px-6">
              <Row title="Two-factor authentication" desc="Require a code at sign-in"><Switch label="Two-factor authentication" on={two} onChange={setTwo} /></Row>
              <Row title="Auto-lock" desc="Lock the app after 5 minutes idle"><Switch label="Auto-lock" on={lock} onChange={setLock} /></Row>
              <Row title="Password" desc="Last changed 62 days ago"><Btn v="secondary" s="sm" onClick={() => toast("Password change is simulated")}>Change</Btn></Row>
              <Row title="Viewing key rotation" desc="Last rotated 41 days ago"><Badge tone="wait">Due in 49 days</Badge></Row>
            </Card>
          )}
          {tab === "wallet" && (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-1 space-y-5 p-6">
              <Field label="Connected wallet"><div className="flex items-center justify-between gap-3 rounded-md border bg-elev p-3"><Mono className="text-text2">{addr(300)}</Mono><Badge tone="ok">Connected</Badge></div></Field>
              <Field label="Default network"><Select label="Default network" value={def} onChange={setDef} options={["Base", "Ethereum", "Arbitrum One", "Polygon"].map((v) => ({ value: v, label: v }))} /></Field>
              <Field label="Display currency"><Select label="Display currency" value={cur} onChange={setCur} options={["USD", "EUR", "GBP"].map((v) => ({ value: v, label: v }))} /></Field>
            </Card>
          )}
          {tab === "prefs" && (
            <>
              <Card className="animate-in fade-in-0 slide-in-from-bottom-1 p-6">
                <h2 className="font-display text-lg font-semibold">Appearance</h2>
                <p className="mb-4 mt-1 text-sm text-mute">Chalk &amp; Oxide for light, Carbon &amp; Copper for dark.</p>
                <div className="grid grid-cols-3 gap-3">
                  {([["light", "Light", Sun, "#F4F1E9", "#B6533C"], ["dark", "Dark", Moon, "#14191D", "#E0785C"], ["system", "System", Monitor, "linear-gradient(90deg,#F4F1E9 50%,#14191D 50%)", "#B6533C"]] as const).map(([v, l, Ico, bg, ac]) => (
                    <button key={v} onClick={() => setPref(v)} aria-pressed={pref === v} className={cn("rounded-lg border p-2.5 text-left transition-all", pref === v ? "border-copper ring-[3px] ring-copper/20" : "hover:border-mute")}>
                      <div className="relative h-14 overflow-hidden rounded-md border" style={{ background: bg }}><span className="absolute bottom-2 left-2 h-1.5 w-8 rounded-[2px]" style={{ background: ac }} /><span className="absolute left-2 top-2 h-1.5 w-12 rounded-[2px] bg-[#8a9399]/50" /></div>
                      <div className="mt-2.5 flex items-center justify-between px-0.5 text-[13px] font-medium"><span className="flex items-center gap-1.5"><Ico size={14} />{l}</span>{pref === v && <Check size={14} className="text-copper" />}</div>
                    </button>
                  ))}
                </div>
              </Card>
              <Card className="animate-in fade-in-0 slide-in-from-bottom-1 divide-y px-6">
                <div className="flex items-center gap-2 py-4"><Bell size={17} className="text-copper" /><h2 className="font-display text-lg font-semibold">Notifications</h2></div>
                {nrows.map(([k, t, d]) => <Row key={k} title={t} desc={d}><Switch label={t} on={n[k]} onChange={(v) => setN({ ...n, [k]: v })} /></Row>)}
              </Card>
            </>
          )}
        </div>
        <Card tone="panel" className="h-fit p-6 lg:col-span-4">
          <Eyebrow>Identity status</Eyebrow>
          <div className="mt-3 flex items-center gap-2"><Badge tone="ok">Verified keys</Badge></div>
          <dl className="mt-4 space-y-3 text-sm">{[["Meta-address", "Active"], ["Spending key", "Device-held"], ["Viewing key", "41 days old"], ["Networks", "4 enabled"]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-text2">{k}</dt><dd className="font-mono text-[13px]">{v}</dd></div>)}</dl>
        </Card>
      </div>
    </>
  );
}
