import { useState, useRef, useEffect } from "react";
import axios from "axios";

const emotionEmoji = { sad: "💙", happy: "🌟", angry: "🔥", neutral: "🎵" };
const emotionLabel = { sad: "Sad", happy: "Happy", angry: "Angry", neutral: "Neutral" };
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// const extractVideoId = (url) => {
//   if (!url) return "";
//   const match = url.match(
//     /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
//   );
//   return match ? match[1] : "";
// };

const extractVideoId = (url) => {
  try {
    const parsed = new URL(url);

    // Standard youtube link
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    // Short link (youtu.be)
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    // Embed / shorts
    const parts = parsed.pathname.split("/");
    return parts.pop();
  } catch {
    return "";
  }
};
const themes = {
  dark: {
    page: "#0f0f0f", app: "#141414", header: "#1a1a1a", body: "#141414",
    bubbleBot: "#1e1e1e", bubbleUser: "#1DB954", bubbleUserText: "#000",
    input: "#252525", inputText: "#f0f0f0", songCard: "#252525",
    player: "#1a1a1a", text: "#f0f0f0", subText: "#888", mutedText: "#777",
    border: "rgba(255,255,255,0.1)", borderLight: "rgba(255,255,255,0.07)",
    borderMid: "rgba(255,255,255,0.08)", chip: "#1e1e1e", chipText: "#aaa",
    dot: "#555", toggleBg: "#252525", toggleText: "#aaa",
  },
  light: {
    page: "#f0f4f8", app: "#ffffff", header: "#ffffff", body: "#f9fafb",
    bubbleBot: "#f1f3f5", bubbleUser: "#1DB954", bubbleUserText: "#fff",
    input: "#f1f3f5", inputText: "#111", songCard: "#f5f7fa",
    player: "#f1f3f5", text: "#111", subText: "#555", mutedText: "#888",
    border: "rgba(0,0,0,0.08)", borderLight: "rgba(0,0,0,0.06)",
    borderMid: "rgba(0,0,0,0.07)", chip: "#f1f3f5", chipText: "#555",
    dot: "#bbb", toggleBg: "#f1f3f5", toggleText: "#555",
  },
};

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const bodyRef = useRef(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const t = isDark ? themes.dark : themes.light;

  useEffect(() => {
    if (bodyRef.current)
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [chat, loading]);

  useEffect(() => {
    setEmbedError(false);
  }, [currentSong]);

  const send = async (msg) => {
    if (!msg.trim()) return;
    setWelcomed(true);
    setMessage("");
    setLoading(true);
    setChat(prev => [...prev, { type: "user", text: msg }]);
    try {
      const res = await axios.post(`${BASE_URL}/chat`, { message: msg });
      const data = res.data;
      setChat(prev => [...prev, { type: "bot", data }]);
      if (data.showPlayer && data.videoUrl) {
        setCurrentSong({ title: data.song, url: data.videoUrl });
      }
    } catch {
      setChat(prev => [...prev, { type: "error" }]);
    }
    setLoading(false);
  };

  const nextSong = () => send("next song");

  return (
    <div style={{ ...s.page, background: t.page }}>
      <div style={{ ...s.app, background: t.app, border: `0.5px solid ${t.border}` }}>

        {/* Header */}
        <div style={{ ...s.header, background: t.header, borderBottom: `0.5px solid ${t.border}` }}>
          <div style={s.headerIcon}>♪</div>
          <div>
            <div style={{ ...s.headerTitle, color: t.text }}>Moodify</div>
            <div style={{ ...s.headerSub, color: t.subText }}>Your emotion-based DJ 🎧</div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ ...s.toggleBtn, background: t.toggleBg, color: t.toggleText, border: `0.5px solid ${t.border}`, marginLeft: "auto" }}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* Chat body */}
        <div ref={bodyRef} style={{ ...s.body, background: t.body }}>
          {!welcomed && (
            <div style={s.welcome}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🎧</div>
              <div style={{ ...s.welcomeTitle, color: t.text }}>Hey! I am Moodify</div>
              <div style={{ ...s.welcomeSub, color: t.mutedText }}>
                Just talk to me like a friend — I will feel your vibe and play the perfect songs 🎵
              </div>
              <div style={s.chips}>
                {["just chilling 😌", "feeling low today", "I am so happy!", "really stressed out"].map(m => (
                  <button
                    key={m}
                    style={{ ...s.chip, background: t.chip, color: t.chipText, border: `0.5px solid ${t.border}` }}
                    onClick={() => send(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} style={{ ...s.row, ...(c.type === "user" ? s.rowUser : {}) }}>
              <div style={{ ...s.avatar, ...(c.type === "user" ? s.avatarUser : s.avatarBot) }}>
                {c.type === "user" ? "U" : "♪"}
              </div>
              <div style={{
                ...s.bubble,
                ...(c.type === "user"
                  ? { background: t.bubbleUser, color: t.bubbleUserText, borderBottomRightRadius: 4 }
                  : { background: t.bubbleBot, color: t.text, border: `0.5px solid ${t.borderMid}`, borderBottomLeftRadius: 4 })
              }}>
                {c.type === "user" && c.text}
                {c.type === "error" && (
                  <span style={{ color: "#f87171" }}>Could not connect to server.</span>
                )}
                {c.type === "bot" && c.data && (
                  <>
                    {c.data.emotion && (
                      <div style={{ ...s.badge, ...s.badgeColors[c.data.emotion] }}>
                        {emotionEmoji[c.data.emotion]} {emotionLabel[c.data.emotion]}
                      </div>
                    )}
                    <div>{c.data.reply}</div>
                    {c.data.showPlayer && c.data.song && (
                      <div style={s.songPill}>
                        <span style={{ fontSize: 16 }}>🎵</span>
                        <span style={{ flex: 1, fontSize: 13, color: t.text }}>{c.data.song}</span>
                        <span style={{ fontSize: 11, color: "#1DB954" }}>playing</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={s.row}>
              <div style={{ ...s.avatar, ...s.avatarBot }}>♪</div>
              <div style={{ ...s.bubble, background: t.bubbleBot, border: `0.5px solid ${t.borderMid}`, borderBottomLeftRadius: 4 }}>
                <div style={s.typing}>
                  <span style={{ ...s.dot, background: t.dot }} />
                  <span style={{ ...s.dot, background: t.dot, animationDelay: "0.2s" }} />
                  <span style={{ ...s.dot, background: t.dot, animationDelay: "0.4s" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Player */}
        {currentSong && (
          <div style={{ ...s.player, background: t.player, border: `0.5px solid ${t.borderMid}` }}>
            <div style={{ ...s.playerHeader, borderBottom: `0.5px solid ${t.borderLight}` }}>
              <div style={s.playingDot} />
              <span style={{ fontSize: 12, color: t.subText, flex: 1 }}>
                Now playing — <strong style={{ color: t.text }}>{currentSong.title}</strong>
              </span>
              <button onClick={nextSong} style={s.nextBtn}>Next</button>
            </div>

            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

              {!isMobile && !embedError && (
                <iframe
                  key={currentSong.url}
                  title={"Now playing " + currentSong.title}
                  width="100%"
                  height="155"
                  src={"https://www.youtube-nocookie.com/embed/" + extractVideoId(currentSong.url) + "?rel=0&modestbranding=1&autoplay=0"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                  onError={() => setEmbedError(true)}
                />
              )}

              {!isMobile && embedError && (
                <div style={{ padding: "10px 0", fontSize: 12, color: t.subText, textAlign: "center" }}>
                  Embed blocked by YouTube — open below to play
                </div>
              )}

              <a
                href={currentSong.url}
                target="_blank"
                rel="noopener noreferrer"
                style={s.ytBtn}
              >
                {isMobile ? "Open in YouTube" : "Watch on YouTube"}
              </a>

            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ ...s.inputArea, background: t.header, borderTop: `0.5px solid ${t.border}` }}>
          <div style={{ ...s.inputWrap, background: t.input, border: `0.5px solid ${t.border}` }}>
            <input
              style={{ ...s.input, color: t.inputText }}
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send(message)}
              placeholder="Just talk to me..."
            />
          </div>
          <button style={s.sendBtn} onClick={() => send(message)}>Send</button>
        </div>

      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" },
  app: { display: "flex", flexDirection: "column", height: "calc(100vh - 32px)", maxHeight: 860, width: "100%", maxWidth: 680, borderRadius: 20, overflow: "hidden", fontFamily: "'Segoe UI', sans-serif" },
  header: { padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 },
  headerIcon: { width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#1DB954,#1aa34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  headerTitle: { fontSize: 15, fontWeight: 500 },
  headerSub: { fontSize: 12, marginTop: 1 },
  toggleBtn: { padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", fontWeight: 500, flexShrink: 0 },
  body: { flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 },
  welcome: { textAlign: "center", padding: "32px 12px" },
  welcomeTitle: { fontSize: 20, fontWeight: 600, marginBottom: 8 },
  welcomeSub: { fontSize: 13, lineHeight: 1.7, maxWidth: 320, margin: "0 auto" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 },
  chip: { padding: "8px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer" },
  row: { display: "flex", gap: 10, alignItems: "flex-end" },
  rowUser: { flexDirection: "row-reverse" },
  avatar: { width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  avatarBot: { background: "linear-gradient(135deg,#1DB954,#1aa34a)", color: "#fff" },
  avatarUser: { background: "#2a2a2a", color: "#aaa", border: "0.5px solid #333" },
  bubble: { maxWidth: "78%", padding: "10px 14px", borderRadius: 16, fontSize: 14, lineHeight: 1.6, wordBreak: "break-word" },
  badge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, marginBottom: 6 },
  badgeColors: {
    sad: { background: "rgba(59,130,246,0.15)", color: "#60a5fa" },
    happy: { background: "rgba(250,204,21,0.15)", color: "#fbbf24" },
    angry: { background: "rgba(239,68,68,0.15)", color: "#f87171" },
    neutral: { background: "rgba(160,160,160,0.15)", color: "#aaa" },
  },
  songPill: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(29,185,84,0.1)", border: "0.5px solid rgba(29,185,84,0.3)" },
  player: { margin: "0 12px 8px", borderRadius: 12, overflow: "hidden", flexShrink: 0 },
  playerHeader: { padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 },
  playingDot: { width: 6, height: 6, borderRadius: "50%", background: "#1DB954", flexShrink: 0 },
  nextBtn: { padding: "5px 12px", borderRadius: 20, background: "rgba(29,185,84,0.15)", border: "0.5px solid rgba(29,185,84,0.4)", color: "#1DB954", fontSize: 12, cursor: "pointer", flexShrink: 0 },
  ytBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 16px", borderRadius: 10, background: "#FF0000", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" },
  inputArea: { padding: "12px 16px 16px", display: "flex", gap: 10, alignItems: "center", flexShrink: 0 },
  inputWrap: { flex: 1, borderRadius: 24, display: "flex", alignItems: "center", padding: "0 16px" },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, padding: "12px 0", width: "100%" },
  sendBtn: { padding: "11px 20px", borderRadius: 24, background: "#1DB954", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#000", flexShrink: 0 },
  typing: { display: "flex", gap: 4, alignItems: "center", padding: "2px 0" },
  dot: { width: 6, height: 6, borderRadius: "50%", display: "inline-block", animation: "bounce 1.2s infinite" },
};