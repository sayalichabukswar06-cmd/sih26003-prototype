import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Gamepad2, Bell, Users, Activity, Globe, Volume2, CheckCircle2,
  TrendingUp, ArrowLeft, Heart, Pill, Utensils, CalendarClock,
  AlertTriangle, Sparkles, Trophy, RotateCcw,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const T = {
  primaryDark: "#0B3D3C",
  primary: "#0E4E4C",
  teal: "#028090",
  mint: "#02C39A",
  amber: "#E8A33D",
  bg: "#F4F9F8",
  card: "#FFFFFF",
  ink: "#13272A",
  muted: "#5A6E70",
};

const LANGS = [
  { code: "en", label: "English" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "brx", label: "Bodo" },
  { code: "kha", label: "Khasi" },
  { code: "mni", label: "মৈতৈলোন্ (Manipuri)" },
];

const STR = {
  home_title: {
    en: "Good afternoon, Ma",
    as: "শুভ দুপৰীয়া, মা",
    brx: "Maonoi maisang, Ma",
    kha: "Mynta bynriew, Ma",
    mni: "খুরুমজরি, Ma",
  },
  play: { en: "Play a Memory Game", as: "স্মৃতি খেল খেলক", brx: "Mongshe gaming khelai", kha: "Khein ka game jingiadei", mni: "Yamna game shaba" },
  reminders: { en: "Today's Reminders", as: "আজিৰ মনত পেলোৱা", brx: "Gaseng sonarob", kha: "Ki jingpynkut sngi mynta", mni: "Ngasigi remind touba" },
  album: { en: "Family Album", as: "পৰিয়ালৰ এলবাম", brx: "Nong album", kha: "Ka album ka iing", mni: "Imung marup album" },
  caregiver: { en: "Caregiver Dashboard", as: "চোৱাচিতাকাৰীৰ ডেছবৰ্ড", brx: "Sanraini dashboard", kha: "Ka dashboard jong ki nongialam", mni: "Yengbiraba dashboard" },
};

function t(key, lang) {
  return STR[key]?.[lang] || STR[key]?.en || key;
}

function speak(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

function IconBadge({ icon: Icon, bg = T.teal, size = 56 }) {
  return (
    <div
      style={{ width: size, height: size, background: bg }}
      className="rounded-full flex items-center justify-center shrink-0"
    >
      <Icon color="#fff" size={size * 0.5} strokeWidth={2.2} />
    </div>
  );
}

function TopBar({ title, onBack, lang, setLang, showLang }) {
  return (
    <div className="flex items-center justify-between px-6 py-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <ArrowLeft size={22} color={T.primaryDark} />
          </button>
        )}
        <h1 className="text-2xl font-bold" style={{ color: T.primaryDark, fontFamily: "Georgia, serif" }}>
          {title}
        </h1>
      </div>
      {showLang && (
        <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-2 py-2 shadow-sm">
          <Globe size={18} color={T.teal} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-sm font-medium outline-none"
            style={{ color: T.ink }}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function PatientHome({ lang, setLang, go }) {
  const cards = [
    { key: "game", icon: Gamepad2, label: t("play", lang), sub: "Match the pairs — gets a little harder each round", bg: T.teal },
    { key: "reminders", icon: Bell, label: t("reminders", lang), sub: "3 things today — tap to hear them read aloud", bg: T.amber },
    { key: "album", icon: Users, label: t("album", lang), sub: "See and hear about the people who love you", bg: T.mint },
  ];
  return (
    <div className="min-h-full" style={{ background: T.bg }}>
      <TopBar title={t("home_title", lang)} lang={lang} setLang={setLang} showLang />
      <div className="px-6 pb-8 flex flex-col gap-5 max-w-xl mx-auto">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => go(c.key)}
            className="bg-white rounded-3xl p-5 flex items-center gap-5 shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <IconBadge icon={c.icon} bg={c.bg} size={64} />
            <div className="flex-1">
              <div className="text-lg font-bold" style={{ color: T.primaryDark }}>{c.label}</div>
              <div className="text-sm mt-0.5" style={{ color: T.muted }}>{c.sub}</div>
            </div>
          </button>
        ))}

        <button
          onClick={() => speak("Hello. I am here whenever you need me. Tap a card to begin.")}
          className="mt-2 flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-full"
          style={{ color: T.teal, background: "#E7F4F2" }}
        >
          <Volume2 size={17} /> Read this screen aloud
        </button>
      </div>
    </div>
  );
}

const EMOJI_POOL = ["🌸", "🐘", "🍵", "🎋", "🦚", "🌾", "🐄", "🪔", "🎣", "🏔️"];

function buildDeck(pairCount) {
  const chosen = EMOJI_POOL.slice(0, pairCount);
  const deck = [...chosen, ...chosen]
    .map((v, i) => ({ id: i, value: v, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

function MemoryGame({ go }) {
  const [level, setLevel] = useState(1);
  const pairCount = Math.min(3 + level, 8);
  const [deck, setDeck] = useState(() => buildDeck(pairCount));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    setDeck(buildDeck(pairCount));
    setFlipped([]);
    setMoves(0);
    setWon(false);
  }, [level]);

  useEffect(() => {
    if (deck.length && deck.every((c) => c.matched)) {
      setWon(true);
      speak("Well done! You matched every pair.");
    }
  }, [deck]);

  function handleFlip(idx) {
    if (lockRef.current || flipped.includes(idx) || deck[idx].matched) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = next;
      setTimeout(() => {
        setDeck((d) => {
          if (d[a].value === d[b].value) {
            return d.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
          }
          return d;
        });
        setFlipped([]);
        lockRef.current = false;
      }, 650);
    }
  }

  const cols = pairCount <= 4 ? 4 : pairCount <= 6 ? 4 : 5;

  return (
    <div className="min-h-full" style={{ background: T.bg }}>
      <TopBar title="Memory Match" onBack={() => go("home")} />
      <div className="px-6 max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: T.teal }}>
            <Sparkles size={16} /> Level {level} · {pairCount} pairs
          </div>
          <div className="text-sm font-medium" style={{ color: T.muted }}>Moves: {moves}</div>
        </div>

        <div
          className="grid gap-3 mb-6"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}
        >
          {deck.map((card, idx) => {
            const isUp = flipped.includes(idx) || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(idx)}
                className="aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform active:scale-95"
                style={{
                  background: isUp ? "#FFFFFF" : T.primary,
                  border: card.matched ? `2px solid ${T.mint}` : "2px solid transparent",
                }}
              >
                {isUp ? card.value : ""}
              </button>
            );
          })}
        </div>

        {won && (
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-3 mb-6 shadow-sm">
            <IconBadge icon={Trophy} bg={T.amber} size={56} />
            <div className="text-lg font-bold" style={{ color: T.primaryDark }}>Well done!</div>
            <div className="text-sm text-center" style={{ color: T.muted }}>
              Solved in {moves} moves. Next round is a little bigger.
            </div>
            <button
              onClick={() => setLevel((l) => l + 1)}
              className="mt-1 px-6 py-3 rounded-full text-white font-semibold flex items-center gap-2"
              style={{ background: T.teal }}
            >
              <RotateCcw size={17} /> Play next level
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Reminders({ go }) {
  const [items, setItems] = useState([
    { id: 1, icon: Pill, time: "8:00 AM", text: "Take morning tablet — blood pressure", done: false },
    { id: 2, icon: Utensils, time: "1:00 PM", text: "Lunch time — remember to drink water too", done: false },
    { id: 3, icon: CalendarClock, time: "5:30 PM", text: "Video call with Priya (daughter)", done: false },
  ]);

  function toggle(id) {
    setItems((its) => its.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  return (
    <div className="min-h-full" style={{ background: T.bg }}>
      <TopBar title="Today's Reminders" onBack={() => go("home")} />
      <div className="px-6 pb-8 flex flex-col gap-4 max-w-xl mx-auto">
        {items.map((it) => (
          <div key={it.id} className="bg-white rounded-3xl p-5 flex items-center gap-4 shadow-sm">
            <IconBadge icon={it.icon} bg={it.done ? T.mint : T.amber} size={56} />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: T.teal }}>{it.time}</div>
              <div className={`text-base font-medium mt-0.5 ${it.done ? "line-through" : ""}`} style={{ color: T.ink }}>
                {it.text}
              </div>
            </div>
            <button
              onClick={() => speak(it.text)}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "#E7F4F2" }}
              aria-label="Read aloud"
            >
              <Volume2 size={19} color={T.teal} />
            </button>
            <button
              onClick={() => toggle(it.id)}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ background: it.done ? T.mint : "#EFEFEF" }}
              aria-label="Mark done"
            >
              <CheckCircle2 size={20} color={it.done ? "#fff" : T.muted} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAMILY = [
  { name: "Priya", rel: "Your daughter", color: T.teal, initial: "P" },
  { name: "Arjun", rel: "Your son", color: T.mint, initial: "A" },
  { name: "Deepa", rel: "Your grandchild", color: T.amber, initial: "D" },
  { name: "Ravi", rel: "Your neighbour & friend", color: "#7C6FB0", initial: "R" },
];

function FamilyAlbum({ go }) {
  return (
    <div className="min-h-full" style={{ background: T.bg }}>
      <TopBar title="Family Album" onBack={() => go("home")} />
      <div className="px-6 pb-8 grid grid-cols-2 gap-4 max-w-xl mx-auto">
        {FAMILY.map((f) => (
          <button
            key={f.name}
            onClick={() => speak(`This is ${f.name}. ${f.rel}.`)}
            className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-sm active:scale-95 transition-transform"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: f.color }}
            >
              {f.initial}
            </div>
            <div className="text-base font-bold" style={{ color: T.primaryDark }}>{f.name}</div>
            <div className="text-xs text-center" style={{ color: T.muted }}>{f.rel}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const TREND = [
  { day: "Mon", score: 62 }, { day: "Tue", score: 65 }, { day: "Wed", score: 60 },
  { day: "Thu", score: 68 }, { day: "Fri", score: 71 }, { day: "Sat", score: 69 },
  { day: "Sun", score: 74 },
];

function Stat({ label, value, icon: Icon, bg }) {
  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <IconBadge icon={Icon} bg={bg} size={44} />
      <div>
        <div className="text-xl font-bold" style={{ color: T.primaryDark }}>{value}</div>
        <div className="text-xs" style={{ color: T.muted }}>{label}</div>
      </div>
    </div>
  );
}

function CaregiverDashboard({ go }) {
  return (
    <div className="min-h-full" style={{ background: T.bg }}>
      <TopBar title="Caregiver Dashboard" onBack={() => go("home")} />
      <div className="px-6 pb-8 max-w-xl mx-auto flex flex-col gap-5">
        <div className="text-sm" style={{ color: T.muted }}>
          Patient: <span className="font-semibold" style={{ color: T.ink }}>Amma (Grandmother), 74</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Games this week" value="12" icon={Gamepad2} bg={T.teal} />
          <Stat label="Reminders followed" value="86%" icon={CheckCircle2} bg={T.mint} />
          <Stat label="Cognitive score" value="74" icon={TrendingUp} bg={T.amber} />
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="text-sm font-bold mb-3" style={{ color: T.primaryDark }}>Cognitive score — last 7 days</div>
          <div style={{ width: "100%", height: 180 }}>
            <ResponsiveContainer>
              <LineChart data={TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#EAF2F1" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: T.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: T.muted }} axisLine={false} tickLine={false} domain={[40, 90]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }} />
                <Line type="monotone" dataKey="score" stroke={T.teal} strokeWidth={3} dot={{ r: 4, fill: T.teal }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="text-sm font-bold mb-3" style={{ color: T.primaryDark }}>Alerts</div>
          <div className="flex items-start gap-3 mb-3">
            <IconBadge icon={AlertTriangle} bg={T.amber} size={36} />
            <div className="text-sm" style={{ color: T.ink }}>
              Missed the 1 PM medicine reminder twice this week — consider a follow-up call.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <IconBadge icon={Heart} bg={T.mint} size={36} />
            <div className="text-sm" style={{ color: T.ink }}>
              Game completion time is improving — memory recall trending up.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [role, setRole] = useState("patient");
  const [lang, setLang] = useState("en");

  function go(v) {
    setView(v);
  }

  const screen = useMemo(() => {
    if (role === "caregiver") return <CaregiverDashboard go={(v) => { setRole("patient"); go(v); }} />;
    switch (view) {
      case "game": return <MemoryGame go={go} />;
      case "reminders": return <Reminders go={go} />;
      case "album": return <FamilyAlbum go={go} />;
      default: return <PatientHome lang={lang} setLang={setLang} go={go} />;
    }
  }, [view, role, lang]);

  return (
    <div className="w-full min-h-[700px] flex flex-col" style={{ fontFamily: "Georgia, 'Calibri', sans-serif" }}>
      <div className="flex items-center justify-center gap-2 py-3" style={{ background: T.primaryDark }}>
        <button
          onClick={() => { setRole("patient"); setView("home"); }}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
          style={{ background: role === "patient" ? T.mint : "transparent", color: role === "patient" ? T.primaryDark : "#BFD8D6" }}
        >
          Patient View
        </button>
        <button
          onClick={() => setRole("caregiver")}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
          style={{ background: role === "caregiver" ? T.mint : "transparent", color: role === "caregiver" ? T.primaryDark : "#BFD8D6" }}
        >
          Caregiver View
        </button>
      </div>
      <div className="flex-1">{screen}</div>
    </div>
  );
}