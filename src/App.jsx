import { useState, useRef, useEffect } from "react";

const PLATFORMS = [
  { id: "twitter",   label: "X Thread",     short: "X",   icon: "𝕏",  color: "#e8e8e8" },
  { id: "linkedin",  label: "LinkedIn",     short: "LI",  icon: "in", color: "#0A66C2" },
  { id: "instagram", label: "Instagram",    short: "IG",  icon: "✦",  color: "#E1306C" },
  { id: "tiktok",    label: "TikTok Script",short: "TT",  icon: "♪",  color: "#ff004f" },
  { id: "email",     label: "Newsletter",   short: "EM",  icon: "✉",  color: "#f59e0b" },
];

const TONES = [
  { id: "authority",      label: "Authority" },
  { id: "conversational", label: "Casual" },
  { id: "witty",          label: "Witty" },
  { id: "storytelling",   label: "Story" },
  { id: "bold",           label: "Bold" },
];

const EXAMPLES = [
  "The biggest mistake founders make is building before validating. I spent 6 months coding a product that nobody wanted. Here's what I learned...",
  "Morning routines are overrated. I used to wake up at 5am, meditate, journal, exercise — and still feel burnt out by noon. The real problem wasn't my routine.",
  "We just hit $10K MRR with zero paid ads. Here's the exact strategy we used to grow from 0 to 200 customers in 90 days using only organic content.",
];

const SYSTEM = `You are Refract — a world-class content strategist. Transform source content into platform-native posts that feel genuinely written for each platform's culture and audience.

Return ONLY valid JSON. No markdown fences. No explanation. No preamble. Shape:
{
  "twitter": "Thread of 6-8 numbered tweets. Each under 280 chars. Irresistible hook tweet first. Insight-packed middle. Strong CTA + question at end.",
  "linkedin": "250-300 word post. Bold non-cliche opener line. Short punchy paragraphs. Personal + professional. Ends with thought-provoking question.",
  "instagram": "Engaging opener. 3-4 short paragraphs with naturally placed emojis. Authentic voice. 25 targeted hashtags separated by line break at end.",
  "tiktok": "60-second video script. HOOK (0-3s): pattern interrupt opener. CONTENT (3-50s): 3 punchy points with [VISUAL: ...] stage directions. CTA (50-60s): follow + comment prompt.",
  "email": "Line 1 must be 'Subject: [compelling subject line]'. Blank line. Greeting. 3 sections with bold subheadings. Key insight box. Sign-off. 280-320 words total."
}
Include only keys for requested platforms. Apply the tone throughout. Write like a top US/UK creator with 500K+ followers.`;

export default function App() {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("authority");
  const [selected, setSelected] = useState(["twitter", "linkedin", "email"]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);
  const [loadMsg, setLoadMsg] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const resultsRef = useRef(null);
  const intervalRef = useRef(null);

  const LOAD_MSGS = [
    "Analysing your content…",
    "Crafting your X thread…",
    "Writing LinkedIn post…",
    "Building your newsletter…",
    "Polishing every word…",
  ];

  useEffect(() => {
    if (loading) {
      intervalRef.current = setInterval(() => setLoadMsg(m => (m + 1) % LOAD_MSGS.length), 1400);
    } else {
      clearInterval(intervalRef.current);
      setLoadMsg(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [loading]);

  const toggle = id =>
    setSelected(p => p.includes(id) ? (p.length > 1 ? p.filter(x => x !== id) : p) : [...p, id]);

  const generate = async () => {
    if (!content.trim() || !selected.length) return;
    setLoading(true); setResults(null); setError(null);
    const toneName = TONES.find(t => t.id === tone)?.label || tone;
    try {
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
      const prompt = `${SYSTEM}\n\nSource:\n\n${content}\n\nTone: ${toneName}\nPlatforms: ${selected.join(", ")}\n\nReturn only JSON.`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 2048 }
          })
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/gi, "").trim());
      setResults(parsed);
      setActiveTab(selected[0]);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (e) {
      setError("Error: " + (e.message || "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const copy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const useExample = () => {
    const ex = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];
    setContent(ex);
    setCharCount(ex.length);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div style={{ background: "#0c0c0b", minHeight: "100vh", color: "#f0ece4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2a2a28;border-radius:2px}
        textarea{resize:none;outline:none;font-family:'DM Sans',sans-serif}
        textarea::placeholder{color:#3a3a38}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        .fade-up{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) forwards}
        .spin{animation:spin .8s linear infinite}
        .pulse{animation:pulse 1.5s ease-in-out infinite}
        .plat{padding:9px 18px;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;border:1px solid #252523;background:#141412;color:#666;transition:all .15s;letter-spacing:.2px}
        .plat:hover{border-color:#3a3a38;color:#aaa}
        .plat.on{background:#f0ece4;border-color:#f0ece4;color:#0c0c0b;font-weight:600}
        .tone{padding:6px 13px;border-radius:3px;font-size:12px;cursor:pointer;border:1px solid #252523;background:transparent;color:#555;transition:all .15s;letter-spacing:.3px}
        .tone:hover{border-color:#3a3a38;color:#aaa}
        .tone.on{border-color:#e8b84b;color:#e8b84b;background:#e8b84b0d}
        .gen{background:#e8b84b;color:#0c0c0b;border:none;padding:14px 32px;font-size:14px;font-weight:700;border-radius:4px;cursor:pointer;transition:all .2s;letter-spacing:.3px;text-transform:uppercase;display:inline-flex;align-items:center;gap:10px}
        .gen:hover{background:#f0ca6b;transform:translateY(-1px);box-shadow:0 8px 30px #e8b84b22}
        .gen:active{transform:translateY(0)}
        .gen:disabled{background:#252523;color:#3a3a38;cursor:not-allowed;transform:none;box-shadow:none}
        .tab{padding:8px 16px;border-radius:3px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#555;transition:all .15s;letter-spacing:.3px;text-transform:uppercase}
        .tab:hover{color:#aaa}
        .tab.on{background:#1e1e1c;color:#f0ece4}
        .cpbtn{padding:7px 16px;border-radius:3px;border:1px solid #252523;background:transparent;color:#666;font-size:12px;cursor:pointer;transition:all .15s;font-weight:500;letter-spacing:.2px}
        .cpbtn:hover{border-color:#3a3a38;color:#aaa}
        .cpbtn.done{border-color:#22c55e44;color:#22c55e;background:#22c55e0d}
        .exbtn{padding:5px 12px;border-radius:3px;border:1px solid #252523;background:transparent;color:#555;font-size:12px;cursor:pointer;transition:all .15s;letter-spacing:.2px}
        .exbtn:hover{border-color:#3a3a38;color:#aaa}
        .divider{width:100%;height:1px;background:linear-gradient(90deg,transparent,#252523,transparent);margin:0}
        .result-text{white-space:pre-wrap;font-size:14px;line-height:1.85;color:#c8c4bc;font-weight:300}
        .char-bar{height:2px;background:#e8b84b;border-radius:1px;transition:width .3s}
        .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:.025;z-index:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")}
      `}</style>

      <div className="noise" />

      {/* ── NAV ── */}
      <nav style={{ padding: "0 40px", height: 58, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #181816", position: "sticky", top: 0, background: "#0c0c0bdd", backdropFilter: "blur(16px)", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 22 22"><rect width="22" height="22" rx="4" fill="#e8b84b"/><path d="M5 7h12M5 11h7M5 15h10" stroke="#0c0c0b" strokeWidth="1.6" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, letterSpacing: "-.3px" }}>Refract</span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#3a3a38", letterSpacing: ".3px", textTransform: "uppercase" }}>Content Multiplier</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center", border: "1px solid #252523", borderRadius: 3, padding: "5px 12px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} className="pulse" />
            <span style={{ fontSize: 11, color: "#555", letterSpacing: ".3px", textTransform: "uppercase" }}>Live</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "72px 40px 52px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #252523", borderRadius: 3, padding: "5px 14px", marginBottom: 28 }}>
          <span style={{ fontSize: 11, color: "#e8b84b", letterSpacing: ".6px", textTransform: "uppercase", fontWeight: 600 }}>✦ Write once. Publish everywhere.</span>
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(44px, 6vw, 72px)", lineHeight: 1.05, letterSpacing: "-2.5px", marginBottom: 22, maxWidth: 700 }}>
          One idea.<br />
          <span style={{ color: "#e8b84b", fontStyle: "italic" }}>Five platforms.</span><br />
          Thirty seconds.
        </h1>
        <p style={{ fontSize: 16, color: "#666", lineHeight: 1.75, maxWidth: 500, fontWeight: 300 }}>
          Paste anything — a blog post, a shower thought, a transcript. Refract writes your Twitter thread, LinkedIn post, Instagram caption, TikTok script, and newsletter. Powered by Claude AI.
        </p>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 40, marginTop: 40, paddingTop: 32, borderTop: "1px solid #181816", flexWrap: "wrap" }}>
          {[["1,200+", "creators using Refract"], ["5 platforms", "in one click"], ["15 hrs", "saved weekly"]].map(([n, l]) => (
            <div key={n}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, fontStyle: "italic", color: "#e8b84b", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 12, color: "#3a3a38", marginTop: 5, letterSpacing: ".2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOOL ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 40px 100px", position: "relative", zIndex: 1 }}>

        {/* Input card */}
        <div style={{ border: "1px solid #252523", borderRadius: 6, overflow: "hidden", background: "#0f0f0d" }}>

          {/* Card header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #181816", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#3a3a38", letterSpacing: ".6px", textTransform: "uppercase", fontWeight: 600 }}>Source Content</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {wordCount > 0 && <span style={{ fontSize: 11, color: "#3a3a38" }}>{wordCount} words</span>}
              <span style={{ fontSize: 11, color: charCount > 1800 ? "#e05252" : "#3a3a38" }}>{charCount}/2000</span>
              <button className="exbtn" onClick={useExample}>Try example</button>
            </div>
          </div>

          {/* Char progress */}
          <div style={{ height: 2, background: "#181816" }}>
            <div className="char-bar" style={{ width: `${(charCount / 2000) * 100}%` }} />
          </div>

          <textarea
            value={content}
            onChange={e => { const v = e.target.value.slice(0, 2000); setContent(v); setCharCount(v.length); }}
            placeholder="Paste your blog post, idea, video script, podcast notes, thread draft — anything. Refract handles the rest..."
            rows={8}
            style={{ width: "100%", background: "transparent", border: "none", padding: "22px 20px", fontSize: 15, color: "#d4d0c8", lineHeight: 1.75, fontWeight: 300 }}
          />

          <div className="divider" />

          {/* Platform selector */}
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "#3a3a38", letterSpacing: ".6px", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Publish To</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {PLATFORMS.map(p => (
                <button key={p.id} className={`plat ${selected.includes(p.id) ? "on" : ""}`} onClick={() => toggle(p.id)}>
                  <span style={{ fontFamily: "monospace", marginRight: 5, fontSize: 11 }}>{p.icon}</span>{p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          {/* Tone + CTA */}
          <div style={{ padding: "14px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#3a3a38", letterSpacing: ".6px", textTransform: "uppercase", fontWeight: 600, marginBottom: 9 }}>Tone of Voice</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {TONES.map(t => (
                  <button key={t.id} className={`tone ${tone === t.id ? "on" : ""}`} onClick={() => setTone(t.id)}>{t.label}</button>
                ))}
              </div>
            </div>
            <button className="gen" disabled={loading || !content.trim() || !selected.length} onClick={generate}>
              {loading ? (
                <>
                  <svg className="spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="#3a3a38" strokeWidth="2"/>
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="#e8b84b" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 13 }}>{LOAD_MSGS[loadMsg]}</span>
                </>
              ) : (
                <>Refract Now <span style={{ opacity: .7 }}>→</span></>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: "11px 16px", background: "#1a0808", border: "1px solid #4a1515", borderRadius: 4, color: "#e05252", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        {results && (
          <div ref={resultsRef} className="fade-up" style={{ marginTop: 20 }}>
            <div style={{ border: "1px solid #252523", borderRadius: 6, overflow: "hidden", background: "#0f0f0d" }}>

              {/* Tab bar */}
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #181816", display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                {PLATFORMS.filter(p => results[p.id]).map(p => (
                  <button key={p.id} className={`tab ${activeTab === p.id ? "on" : ""}`} onClick={() => setActiveTab(p.id)}>
                    <span style={{ fontFamily: "monospace", marginRight: 5, fontSize: 10 }}>{p.icon}</span>{p.short}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "#22c55e", letterSpacing: ".4px", textTransform: "uppercase", fontWeight: 600 }}>✓ {Object.keys(results).length} posts ready</span>
                </div>
              </div>

              {/* Content */}
              {activeTab && results[activeTab] && (
                <div style={{ padding: "24px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#3a3a38", letterSpacing: ".6px", textTransform: "uppercase", fontWeight: 600 }}>
                        {PLATFORMS.find(p => p.id === activeTab)?.label}
                      </span>
                      <span style={{ fontSize: 10, color: "#252523" }}>·</span>
                      <span style={{ fontSize: 10, color: "#3a3a38", textTransform: "uppercase", letterSpacing: ".4px" }}>
                        {TONES.find(t => t.id === tone)?.label} tone
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className={`cpbtn ${copied === activeTab ? "done" : ""}`} onClick={() => copy(activeTab, results[activeTab])}>
                        {copied === activeTab ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="result-text">{results[activeTab]}</div>

                  <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #181816", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#3a3a38", textTransform: "uppercase", letterSpacing: ".4px" }}>Copy others:</span>
                    {PLATFORMS.filter(p => results[p.id] && p.id !== activeTab).map(p => (
                      <button key={p.id} className={`cpbtn ${copied === p.id ? "done" : ""}`} onClick={() => copy(p.id, results[p.id])}>
                        {copied === p.id ? `✓ ${p.short}` : `${p.icon} ${p.short}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── PRICING ── */}
      <div style={{ borderTop: "1px solid #181816", padding: "72px 40px 80px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, color: "#e8b84b", letterSpacing: ".8px", textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>✦ Pricing</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 40, letterSpacing: "-1.5px", lineHeight: 1.1 }}>
              Simple. Transparent.<br /><span style={{ fontStyle: "italic", color: "#666" }}>Cancel any time.</span>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { name: "Starter", price: 29, desc: "Solo creators", perks: ["50 repurposes/mo", "3 platforms", "3 tone styles", "7-day trial"], hot: false },
              { name: "Pro", price: 79, desc: "Daily publishers", perks: ["Unlimited repurposes", "All 5 platforms", "All 5 tones", "Priority speed", "Bulk mode (10 at once)"], hot: true },
              { name: "Agency", price: 199, desc: "Teams & freelancers", perks: ["Everything in Pro", "5 team seats", "Client workspaces", "API access", "White-label"], hot: false },
            ].map(plan => (
              <div key={plan.name} style={{ border: `1px solid ${plan.hot ? "#e8b84b55" : "#252523"}`, borderRadius: 6, padding: "26px 22px", background: plan.hot ? "#0f0d08" : "#0f0f0d", position: "relative", overflow: "hidden" }}>
                {plan.hot && <div style={{ position: "absolute", top: 14, right: 14, fontSize: 10, fontWeight: 700, letterSpacing: ".5px", color: "#e8b84b", textTransform: "uppercase" }}>Popular</div>}
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: "#3a3a38", marginBottom: 18 }}>{plan.desc}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, fontStyle: "italic", color: plan.hot ? "#e8b84b" : "#f0ece4" }}>${plan.price}</span>
                  <span style={{ fontSize: 13, color: "#3a3a38" }}>/month</span>
                </div>
                <ul style={{ listStyle: "none", marginBottom: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.perks.map(p => (
                    <li key={p} style={{ fontSize: 13, color: "#666", display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <span style={{ color: "#22c55e", flexShrink: 0, marginTop: 1 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
                <button style={{ width: "100%", padding: "11px", borderRadius: 4, border: `1px solid ${plan.hot ? "#e8b84b" : "#252523"}`, background: plan.hot ? "#e8b84b" : "transparent", color: plan.hot ? "#0c0c0b" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: ".4px", textTransform: "uppercase" }}>
                  Start free trial
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#3a3a38", marginTop: 18, textAlign: "center", letterSpacing: ".2px" }}>7-day free trial on all plans · No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #181816", padding: "22px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Refract</span>
        <span style={{ fontSize: 11, color: "#3a3a38", letterSpacing: ".3px", textTransform: "uppercase" }}>Powered by Claude AI · Built for global creators</span>
      </div>
    </div>
  );
}
