const { analyzeMessage } = require("../services/emotionService");
const { getOneSong } = require("../services/songService");

const sessionHistory = {};
const sessionEmotion = {};
const sessionPlayed = {};

const handleChat = async (req, res) => {
  const message = req.body?.message;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const sessionKey = req.ip || req.connection.remoteAddress || "default";

  if (!sessionHistory[sessionKey]) sessionHistory[sessionKey] = [];
  if (!sessionPlayed[sessionKey]) sessionPlayed[sessionKey] = [];

  const history = sessionHistory[sessionKey];
  const playedUrls = sessionPlayed[sessionKey];

  // ✅ next song triggers
  const moreTriggers = ["next", "another", "more", "play more", "next song",
    "one more", "keep going", "continue", "yep", "yes", "yeah",
    "loved it", "nice", "good", "great song", "liked it", "play another"];

  const isMoreRequest = moreTriggers.some(t => message.toLowerCase().includes(t));

  if (isMoreRequest && sessionEmotion[sessionKey]) {
    const song = getOneSong(sessionEmotion[sessionKey], playedUrls);
    playedUrls.push(song.url);

    const moreReplies = {
      sad: ["Here's another one 💙", "This one hits too 🎵", "One more for the feels 💙"],
      happy: ["Keep the energy! 🌟", "Another banger! 🔥", "Let's keep vibing! 🎉"],
      angry: ["Channel that energy 💪", "Let it out 🔥"],
      neutral: ["Here's another chill one 🎵", "Keeping the vibe 😌"],
    };
    const replies = moreReplies[sessionEmotion[sessionKey]] || moreReplies.neutral;
    const reply = replies[Math.floor(Math.random() * replies.length)];

    return res.json({
      reply,
      emotion: sessionEmotion[sessionKey],
      song: song.title,
      videoUrl: song.url,
      showPlayer: true,
    });
  }

  // analyze message
  const analysis = await analyzeMessage(message, history);

  console.log("📊 Analysis result:", analysis); // ← debug log

  // save history
  history.push({ role: "user", text: message });
  history.push({ role: "bot", text: analysis.reply });
  if (history.length > 20) sessionHistory[sessionKey] = history.slice(-20);

  // ✅ pure chat — no song
  if (analysis.suggestSongs === false || (!analysis.suggestSongs && !analysis.emotion)) {
    return res.json({
      reply: analysis.reply,
      emotion: null,
      song: null,
      videoUrl: null,
      showPlayer: false,
    });
  }

  // ✅ emotion detected — play song
  const emotion = analysis.emotion || "neutral";
  sessionEmotion[sessionKey] = emotion;

  const song = getOneSong(emotion, playedUrls);
  playedUrls.push(song.url);

  console.log("🎵 Playing song:", song); // ← debug log

  return res.json({
    emotion,
    reply: analysis.reply,
    song: song.title,
    videoUrl: song.url,
    showPlayer: true,
  });
};

module.exports = { handleChat };