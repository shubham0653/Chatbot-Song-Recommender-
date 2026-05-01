import { useState, useRef, useEffect } from "react";
import axios from "axios";

const emotionEmoji = { sad: "💙", happy: "🌟", angry: "🔥", neutral: "🎵" };
const emotionLabel = { sad: "Sad", happy: "Happy", angry: "Angry", neutral: "Neutral" };
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const extractVideoId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    const parts = parsed.pathname.split("/");
    return parts.pop();
  } catch {
    return "";
  }
};

const themes = {
  dark: {
    page: "#0a0a0a",
    sidebar: "#111111",
    sidebarBorder: "rgba(255,255,255,0.06)",
    app: "#141414",
    header: "#1a1a1a",
    body: "#0f0f0f",
    bubbleBot: "#1e1e1e",
    bubbleUser: "#1DB954",
    bubbleUserText: "#000",
    input: "#1e1e1e",
    inputText: "#f0f0f0",
    player: "#1a1a1a",
    text: "#f0f0f0",
    subText: "#888",
    mutedText: "#555",
    border: "rgba(255,255,255,0.07)",
    borderMid: "rgba(255,255,255,0.08)",
    chip: "#1e1e1e",
    chipText: "#aaa",
    dot: "#444",
    toggleBg: "#252525",
    toggleText: "#aaa",
    sidebarItem: "rgba(255,255,255,0.03)",
    sidebarItemHover: "rgba(255,255,255,0.06)",
    sidebarActive: "rgba(29,185,84,0.1)",
  },
  light: {
    page: "#f0f4f8",
    sidebar: "#ffffff",
    sidebarBorder: "rgba(0,0,0,0.06)",
    app: "#ffffff",
    header: "#ffffff",
    body: "#f5f7fa",
    bubbleBot: "#f1f3f5",
    bubbleUser: "#1DB954",
    bubbleUserText: "#fff",
    input: "#f1f3f5",
    inputText: "#111",
    player: "#f1f3f5",
    text: "#111",
    subText: "#555",
    mutedText: "#999",
    border: "rgba(0,0,0,0.07)",
    borderMid: "rgba(0,0,0,0.07)",
    chip: "#f1f3f5",
    chipText: "#555",
    dot: "#bbb",
    toggleBg: "#f1f3f5",
    toggleText: "#555",
    sidebarItem: "rgba(0,0,0,0.02)",
    sidebarItemHover: "rgba(0,0,0,0.04)",
    sidebarActive: "rgba(29,185,84,0.08)",
  },
};

const sidebarChats = [
  { id: 1, name: "Moodify", sub: "Your emotion-based DJ 🎧", active: true },
  { id: 2, name: "Sad Vibes", sub: "Last: Channa Mereya", active: false },
  { id: 3, name: "Hype Mode", sub: "Last: Levels - Avicii", active: false },
  { id: 4, name: "Chill Zone", sub: "Last: Lo-fi playlist", active: false },
];

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
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
    inputRef.current?.focus();
  };

  const nextSong = () => send("next song");

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }
        
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .chat-wrapper {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          font-family: 'Segoe UI', -apple-system, sans-serif;
          background: ${t.page};
        }

        /* SIDEBAR */
        .sidebar {
          width: 340px;
          min-width: 340px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: ${t.sidebar};
          border-right: 1px solid ${t.sidebarBorder};
          transition: transform 0.3s ease;
          z-index: 10;
          flex-shrink: 0;
        }
        .sidebar-header {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid ${t.sidebarBorder};
          background: ${t.header};
        }
        .sidebar-logo {
          width: 40px; height: 40px; border-radius: 50%;
          background: linear-gradient(135deg,#1DB954,#1aa34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .sidebar-title { font-size: 17px; font-weight: 600; color: ${t.text}; }
        .sidebar-sub { font-size: 12px; color: ${t.subText}; margin-top: 2px; }
        .sidebar-toggle {
          margin-left: auto;
          padding: 7px 13px;
          border-radius: 20px;
          background: ${t.toggleBg};
          border: 1px solid ${t.border};
          color: ${t.toggleText};
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
          white-space: nowrap;
        }
        .sidebar-search {
          padding: 12px 16px;
          border-bottom: 1px solid ${t.sidebarBorder};
        }
        .sidebar-search input {
          width: 100%;
          padding: 9px 14px;
          border-radius: 20px;
          background: ${t.input};
          border: 1px solid ${t.border};
          color: ${t.text};
          font-size: 13px;
          outline: none;
        }
        .sidebar-search input::placeholder { color: ${t.mutedText}; }
        .sidebar-list { flex: 1; overflow-y: auto; padding: 8px 0; }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-left: 3px solid transparent;
          transition: all 0.15s;
        }
        .sidebar-item.active {
          background: ${t.sidebarActive};
          border-left-color: #1DB954;
        }
        .sidebar-item:not(.active):hover { background: ${t.sidebarItemHover}; }
        .sidebar-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg,#1DB954,#1aa34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0; color: #fff;
        }
        .sidebar-item-name { font-size: 14px; font-weight: 500; color: ${t.text}; }
        .sidebar-item-sub { font-size: 12px; color: ${t.subText}; margin-top: 2px; }

        /* MAIN CHAT */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          min-width: 0;
        }
        .chat-header {
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: ${t.header};
          border-bottom: 1px solid ${t.border};
          flex-shrink: 0;
        }
        .mobile-back {
          display: none;
          width: 34px; height: 34px;
          border-radius: 50%;
          background: ${t.toggleBg};
          border: 1px solid ${t.border};
          color: ${t.text};
          font-size: 16px;
          cursor: pointer;
          align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .header-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg,#1DB954,#1aa34a);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }
        .header-info { flex: 1; min-width: 0; }
        .header-name { font-size: 15px; font-weight: 600; color: ${t.text}; }
        .header-status { font-size: 12px; color: #1DB954; display: flex; align-items: center; gap: 5px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #1DB954; animation: pulse 2s infinite; }

        /* CHAT BODY */
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          background: ${t.body};
          scroll-behavior: smooth;
        }
        .chat-body::-webkit-scrollbar { width: 4px; }
        .chat-body::-webkit-scrollbar-track { background: transparent; }
        .chat-body::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 4px; }

        .welcome { text-align: center; padding: 40px 16px; animation: fadeIn 0.4s ease; }
        .welcome-icon { font-size: 52px; margin-bottom: 16px; }
        .welcome-title { font-size: 22px; font-weight: 700; color: ${t.text}; margin-bottom: 8px; }
        .welcome-sub { font-size: 14px; color: ${t.mutedText}; line-height: 1.7; max-width: 360px; margin: 0 auto; }
        .chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 20px; }
        .chip {
          padding: 9px 18px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          background: ${t.chip};
          color: ${t.chipText};
          border: 1px solid ${t.border};
          transition: all 0.15s;
        }
        .chip:hover { border-color: #1DB954; color: #1DB954; }

        .msg-row { display: flex; gap: 10px; align-items: flex-end; animation: fadeIn 0.25s ease; }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
        .avatar-bot { background: linear-gradient(135deg,#1DB954,#1aa34a); color: #fff; }
        .avatar-user { background: ${t.input}; color: ${t.subText}; border: 1px solid ${t.border}; }
        .bubble {
          max-width: 65%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          word-break: break-word;
        }
        .bubble-bot {
          background: ${t.bubbleBot};
          color: ${t.text};
          border: 1px solid ${t.borderMid};
          border-bottom-left-radius: 4px;
        }
        .bubble-user {
          background: ${t.bubbleUser};
          color: ${t.bubbleUserText};
          border-bottom-right-radius: 4px;
        }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: 11px; margin-bottom: 6px;
        }
        .song-pill {
          display: flex; align-items: center; gap: 8px;
          margin-top: 10px; padding: 8px 12px; border-radius: 10px;
          background: rgba(29,185,84,0.1); border: 1px solid rgba(29,185,84,0.25);
          font-size: 13px;
        }

        /* PLAYER */
        .player {
          margin: 0 16px 8px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          background: ${t.player};
          border: 1px solid ${t.border};
        }
        .player-header {
          padding: 10px 14px;
          display: flex; align-items: center; gap: 8px;
          border-bottom: 1px solid ${t.border};
        }
        .playing-dot { width: 6px; height: 6px; border-radius: 50%; background: #1DB954; flex-shrink: 0; }
        .next-btn {
          padding: 5px 12px; border-radius: 20px;
          background: rgba(29,185,84,0.15); border: 1px solid rgba(29,185,84,0.3);
          color: #1DB954; font-size: 12px; cursor: pointer; flex-shrink: 0;
        }
        .yt-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 16px; border-radius: 10px;
          background: #FF0000; color: #fff;
          font-size: 13px; font-weight: 600; text-decoration: none;
        }

        /* INPUT */
        .input-area {
          padding: 12px 16px 14px;
          display: flex; gap: 10px; align-items: center; flex-shrink: 0;
          background: ${t.header};
          border-top: 1px solid ${t.border};
        }
        .input-wrap {
          flex: 1; border-radius: 24px;
          display: flex; align-items: center;
          padding: 0 16px;
          background: ${t.input};
          border: 1px solid ${t.border};
        }
        .input-wrap input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; padding: 12px 0;
          color: ${t.inputText}; width: 100%;
        }
        .input-wrap input::placeholder { color: ${t.mutedText}; }
        .send-btn {
          padding: 11px 20px; border-radius: 24px;
          background: #1DB954; border: none; cursor: pointer;
          font-size: 14px; font-weight: 600; color: #000; flex-shrink: 0;
          transition: transform 0.1s, opacity 0.1s;
        }
        .send-btn:active { transform: scale(0.95); opacity: 0.85; }

        /* TYPING */
        .typing { display: flex; gap: 4px; align-items: center; padding: 2px 0; }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: ${t.dot};
          display: inline-block;
          animation: bounce 1.2s infinite;
        }

        /* MOBILE OVERLAY */
        .sidebar-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0; top: 0; bottom: 0;
            transform: translateX(-100%);
            width: 85vw;
            min-width: unset;
          }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .mobile-back { display: flex; }
          .bubble { max-width: 82%; }
          .chat-body { padding: 16px 12px; }
          .chat-header { padding: 0 14px; }
          .input-area { padding: 10px 12px 12px; }
          .send-btn { padding: 11px 16px; }
        }

        @media (min-width: 769px) and (max-width: 1100px) {
          .sidebar { width: 260px; min-width: 260px; }
          .bubble { max-width: 72%; }
        }
      `}</style>

      <div className="chat-wrapper">

        {/* Sidebar overlay for mobile */}
        <div
          className={`sidebar-overlay${showSidebar ? " open" : ""}`}
          onClick={() => setShowSidebar(false)}
        />

        {/* SIDEBAR */}
        <div className={`sidebar${showSidebar ? " open" : ""}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">♪</div>
            <div>
              <div className="sidebar-title">Moodify</div>
              <div className="sidebar-sub">Music for every mood</div>
            </div>
            <button className="sidebar-toggle" onClick={() => setIsDark(!isDark)}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
          <div className="sidebar-search">
            <input placeholder="🔍  Search or start new chat" />
          </div>
          <div className="sidebar-list">
            {sidebarChats.map(item => (
              <div key={item.id} className={`sidebar-item${item.active ? " active" : ""}`}>
                <div className="sidebar-avatar">♪</div>
                <div>
                  <div className="sidebar-item-name">{item.name}</div>
                  <div className="sidebar-item-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CHAT */}
        <div className="chat-main">

          {/* Header */}
          <div className="chat-header">
            <button className="mobile-back" onClick={() => setShowSidebar(true)}>☰</button>
            <div className="header-avatar">♪</div>
            <div className="header-info">
              <div className="header-name">Moodify</div>
              <div className="header-status">
                <span className="status-dot" />
                online — feeling your vibe
              </div>
            </div>
            <button
              className="sidebar-toggle"
              onClick={() => setIsDark(!isDark)}
              style={{ marginLeft: "auto" }}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* Chat body */}
          <div className="chat-body" ref={bodyRef}>
            {!welcomed && (
              <div className="welcome">
                <div className="welcome-icon">🎧</div>
                <div className="welcome-title">Hey! I am Moodify</div>
                <div className="welcome-sub">
                  Just talk to me like a friend — I will feel your vibe and play the perfect songs 🎵
                </div>
                <div className="chips">
                  {["just chilling 😌", "feeling low today", "I am so happy!", "really stressed out"].map(m => (
                    <button key={m} className="chip" onClick={() => send(m)}>{m}</button>
                  ))}
                </div>
              </div>
            )}

            {chat.map((c, i) => (
              <div key={i} className={`msg-row${c.type === "user" ? " user" : ""}`}>
                <div className={`avatar${c.type === "user" ? " avatar-user" : " avatar-bot"}`}>
                  {c.type === "user" ? "U" : "♪"}
                </div>
                <div className={`bubble${c.type === "user" ? " bubble-user" : " bubble-bot"}`}>
                  {c.type === "user" && c.text}
                  {c.type === "error" && <span style={{ color: "#f87171" }}>Could not connect to server.</span>}
                  {c.type === "bot" && c.data && (
                    <>
                      {c.data.emotion && (
                        <div className="badge" style={badgeColors[c.data.emotion]}>
                          {emotionEmoji[c.data.emotion]} {emotionLabel[c.data.emotion]}
                        </div>
                      )}
                      <div>{c.data.reply}</div>
                      {c.data.showPlayer && c.data.song && (
                        <div className="song-pill">
                          <span style={{ fontSize: 16 }}>🎵</span>
                          <span style={{ flex: 1, color: t.text }}>{c.data.song}</span>
                          <span style={{ fontSize: 11, color: "#1DB954" }}>playing</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg-row">
                <div className="avatar avatar-bot">♪</div>
                <div className="bubble bubble-bot">
                  <div className="typing">
                    <span className="dot" />
                    <span className="dot" style={{ animationDelay: "0.2s" }} />
                    <span className="dot" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player */}
          {currentSong && (
            <div className="player">
              <div className="player-header">
                <div className="playing-dot" />
                <span style={{ fontSize: 12, color: t.subText, flex: 1 }}>
                  Now playing — <strong style={{ color: t.text }}>{currentSong.title}</strong>
                </span>
                <button className="next-btn" onClick={nextSong}>Next ›</button>
              </div>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {!isMobile && !embedError && (
                  <iframe
                    key={currentSong.url}
                    title={"Now playing " + currentSong.title}
                    width="100%" height="155"
                    src={`https://www.youtube-nocookie.com/embed/${extractVideoId(currentSong.url)}?rel=0&modestbranding=1&autoplay=0`}
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
                <a href={currentSong.url} target="_blank" rel="noopener noreferrer" className="yt-btn">
                  {isMobile ? "Open in YouTube" : "Watch on YouTube"}
                </a>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="input-area">
            <div className="input-wrap">
              <input
                ref={inputRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send(message)}
                placeholder="Just talk to me..."
              />
            </div>
            <button className="send-btn" onClick={() => send(message)}>Send</button>
          </div>

        </div>
      </div>
    </>
  );
}

const badgeColors = {
  sad: { background: "rgba(59,130,246,0.15)", color: "#60a5fa" },
  happy: { background: "rgba(250,204,21,0.15)", color: "#fbbf24" },
  angry: { background: "rgba(239,68,68,0.15)", color: "#f87171" },
  neutral: { background: "rgba(160,160,160,0.15)", color: "#aaa" },
};