import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { Toaster } from "sonner";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownToLine, ArrowLeftRight, Bell, Fingerprint, LayoutDashboard, LogOut, Menu, Moon, Send as SendIc, Settings as SettingsIc, Sun, Wallet as WalletIc, X, Receipt, Info } from "lucide-react";
import { Brand, Logo, Wordmark, cn, NOTIFS0, type Notif, type Tx } from "./ui";
import { Forgot, Landing, Login, Register } from "./public";
import { Dashboard, Identity, Receive, Send, Transactions, TxModal } from "./pages1";
import { Notifications, Settings, Wallet, type ThemePref } from "./pages2";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "send", label: "Send", icon: SendIc },
  { id: "receive", label: "Receive", icon: ArrowDownToLine },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "identity", label: "My Identity", icon: Fingerprint },
  { id: "wallet", label: "Wallet", icon: WalletIc },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: SettingsIc },
];
const PUBLIC = ["landing", "login", "register", "forgot"];
const MOBILE_TABS = ["dashboard", "send", "receive", "transactions"];

export default function App() {
  const [route, setRoute] = useState(() => (window.location.hash.slice(1) || "landing"));
  const [pref, setPref] = useState<ThemePref>(() => (localStorage.getItem("sp-theme") as ThemePref) || "system");
  const [sysDark, setSysDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS0);
  const [tx, setTx] = useState<Tx | null>(null);
  const [drawer, setDrawer] = useState(false);
  const dark = pref === "dark" || (pref === "system" && sysDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const f = () => setSysDark(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    const r = document.documentElement;
    r.classList.add("theme-anim");
    r.classList.toggle("dark", dark);
    const t = setTimeout(() => r.classList.remove("theme-anim"), 450);
    return () => clearTimeout(t);
  }, [dark]);
  const setTheme = (p: ThemePref) => { setPref(p); try { localStorage.setItem("sp-theme", p); } catch { /* ignore */ } };

  const go = useCallback((r: string) => { setRoute(r); setDrawer(false); window.location.hash = r; window.scrollTo({ top: 0 }); }, []);
  useEffect(() => { const f = () => setRoute(window.location.hash.slice(1) || "landing"); window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);

  const unread = notifs.filter((n) => !n.read).length;
  const toggle = () => setTheme(dark ? "light" : "dark");
  let body;
  if (route === "landing") body = <Landing go={go} dark={dark} toggle={toggle} />;
  else if (route === "login") body = <Login go={go} />;
  else if (route === "register") body = <Register go={go} />;
  else if (route === "forgot") body = <Forgot go={go} />;

  if (PUBLIC.includes(route) && body) {
    return (
      <MotionConfig reducedMotion="user">
        <motion.div key={route} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>{body}</motion.div>
        <Toaster theme={dark ? "dark" : "light"} position="top-center" />
      </MotionConfig>
    );
  }

  const active = NAV.some((n) => n.id === route) ? route : "dashboard";
  const page = {
    dashboard: <Dashboard go={go} openTx={setTx} />,
    send: <Send go={go} />,
    receive: <Receive />,
    transactions: <Transactions openTx={setTx} />,
    identity: <Identity />,
    wallet: <Wallet go={go} />,
    notifications: <Notifications items={notifs} setItems={setNotifs} />,
    settings: <Settings pref={pref} setPref={setTheme} />,
  }[active];

  const NavBtn = ({ n, rail }: { n: (typeof NAV)[number]; rail?: boolean }) => {
    const on = n.id === active;
    return (
      <button onClick={() => go(n.id)} title={n.label} aria-current={on ? "page" : undefined}
        className={cn("group relative flex h-11 items-center gap-3 rounded-md text-sm transition-colors", rail ? "w-11 justify-center" : "w-full px-3", on ? "bg-copper-soft font-medium text-copper-hover dark:text-copper" : "text-text2 hover:bg-surface-2 hover:text-foreground")}>
        {on && <motion.span layoutId={rail ? "ind-r" : "ind"} className="absolute -left-3 top-2 h-7 w-[3px] rounded-r bg-copper" />}
        <n.icon size={19} />
        {!rail && <span>{n.label}</span>}
        {n.id === "notifications" && unread > 0 && (rail ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-copper" /> : <span className="ml-auto rounded-sm bg-copper px-1.5 font-mono text-[11px] text-on-copper">{unread}</span>)}
      </button>
    );
  };
  const Profile = ({ compact }: { compact?: boolean }) => (
    <div className={cn("flex items-center gap-3", compact && "flex-col")}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2A3238] font-display text-sm font-semibold text-[#E9E7DF]">AR</span>
      {!compact && <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">Alma Reyes</p><p className="truncate font-mono text-[11px] text-mute">0x7c3e…a91f</p></div>}
      <button onClick={() => go("landing")} aria-label="Sign out" title="Sign out" className="flex h-10 w-10 items-center justify-center rounded-md text-mute hover:bg-surface-2 hover:text-foreground"><LogOut size={17} /></button>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh">
        {/* Desktop sidebar / tablet rail */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col items-center border-r bg-sidebar px-0 py-5 md:flex lg:w-[256px] lg:items-stretch lg:px-4">
          <div className="mb-8 flex justify-center lg:justify-start lg:px-2"><span className="lg:hidden"><Logo size={32} /></span><span className="hidden lg:block"><Brand onClick={() => go("dashboard")} /></span></div>
          <nav className="flex flex-1 flex-col gap-1 px-3 lg:px-0">
            {NAV.map((n) => (<div key={n.id}><span className="lg:hidden"><NavBtn n={n} rail /></span><span className="hidden lg:block"><NavBtn n={n} /></span></div>))}
          </nav>
          <div className="mt-4 space-y-3 border-t px-3 pt-4 lg:px-0">
            <button onClick={toggle} className="hidden h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-text2 hover:bg-surface-2 lg:flex">{dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? "Light mode" : "Dark mode"}</button>
            <span className="lg:hidden"><Profile compact /></span><span className="hidden lg:block"><Profile /></span>
          </div>
        </aside>

        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-glass px-4 backdrop-blur-md md:hidden">
          <Brand onClick={() => go("dashboard")} />
          <div className="flex items-center">
            <button onClick={() => go("notifications")} aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center text-text2"><Bell size={20} />{unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-copper" />}</button>
            <button onClick={() => setDrawer(true)} aria-label="Open menu" className="flex h-11 w-11 items-center justify-center text-text2"><Menu size={21} /></button>
          </div>
        </header>

        <div className="md:pl-[76px] lg:pl-[256px]">
          <div className="flex items-start gap-2 border-b bg-warn-soft px-4 py-2 text-xs text-warn-text sm:px-8">
            <Info size={14} className="mt-px shrink-0" /><p><b className="font-semibold">Prototype.</b> All balances, addresses and payments are simulated. No blockchain transactions are executed.</p>
          </div>
          <main className="mx-auto max-w-[1180px] px-4 pb-28 pt-6 sm:px-8 md:pb-16 lg:pt-10">
            <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: "easeOut" }}>{page}</motion.div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-glass pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Primary">
          {[...NAV.filter((n) => MOBILE_TABS.includes(n.id)), { id: "more", label: "More", icon: Menu }].map((n) => {
            const on = n.id === "more" ? !MOBILE_TABS.includes(active) : n.id === active;
            return (
              <button key={n.id} onClick={() => (n.id === "more" ? setDrawer(true) : go(n.id))} aria-current={on ? "page" : undefined} className={cn("relative flex h-16 flex-col items-center justify-center gap-1 text-[11px]", on ? "text-copper" : "text-mute")}>
                {on && <span className="absolute inset-x-5 top-0 h-[2px] bg-copper" />}
                <n.icon size={20} />{n.label === "Transactions" ? "Activity" : n.label}
              </button>
            );
          })}
        </nav>

        <Dialog.Root open={drawer} onOpenChange={setDrawer}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-[#0c1013]/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-[min(320px,88vw)] flex-col border-l bg-popover p-4 shadow-overlay outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title><Dialog.Description className="sr-only">All sections</Dialog.Description>
              <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2.5"><Logo size={28} /><Wordmark /></span><Dialog.Close aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-md text-mute hover:bg-surface-2"><X size={20} /></Dialog.Close></div>
              <nav className="flex flex-1 flex-col gap-1">{NAV.map((n) => <NavBtn key={n.id} n={n} />)}</nav>
              <div className="space-y-3 border-t pt-4">
                <button onClick={toggle} className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-text2 hover:bg-surface-2">{dark ? <Sun size={17} /> : <Moon size={17} />}{dark ? "Light mode" : "Dark mode"}</button>
                <Profile />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <TxModal tx={tx} onClose={() => setTx(null)} />
        <Toaster theme={dark ? "dark" : "light"} position="top-center" />
      </div>
    </MotionConfig>
  );
}
