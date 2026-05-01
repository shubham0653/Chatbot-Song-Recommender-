const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeMessage = async (message, conversationHistory = []) => {
  try {
    const historyText = conversationHistory.length > 0
      ? conversationHistory
          .slice(-8)
          .map(m => `${m.role === "user" ? "User" : "Moodify"}: ${m.text}`)
          .join("\n")
      : "";

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Moodify — a chill, friendly music assistant who talks like a real person.
You chat naturally and suggest songs when you detect emotion from the conversation.
You NEVER ask "how are you feeling?" — you figure it out yourself from context.

Always reply in this exact JSON format with no extra text, no markdown, no backticks:
{"type":"chat","emotion":null,"reply":"your reply","suggestSongs":false}

Type rules:
- "chat" → greetings, thanks, bye, casual talk → emotion null, suggestSongs false
- "emotion" → user shares or implies any feeling → suggestSongs true

Emotion values (only these exact strings):
- "sad" → low, lonely, heartbroken, depressed, crying, hurt, miss someone, lost, empty, broken, overwhelmed, bad day, anxious, not okay
- "happy" → excited, joyful, great, amazing, celebrating, love, blessed, best day, on top of world, promoted
- "angry" → frustrated, mad, annoyed, irritated, hate, fed up, stressed, furious, worst
- "neutral" → bored, okay, fine, chilling, meh, nothing specific, play a song, suggest music

Smart context rules:
- "me too", "same", "yeah" → check history for emotion context
- "what about you", "how are you" → reply playfully like "Just vibing and loading playlists 🎧"
- Short replies like "ok", "lol", "haha" → chat back casually
- If user asks to play/suggest a song → type emotion, emotion neutral, suggestSongs true
- After 2+ sad messages → suggest songs naturally

Reply style:
- Warm, real, natural — like a caring best friend
- 1-2 sentences max
- Never say "I am an AI"`
        },
        {
          role: "user",
          content: `${historyText ? `Conversation so far:\n${historyText}\n\n` : ""}Current message: "${message}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const raw = response.choices[0].message.content.trim();
    console.log("✅ OpenAI raw:", raw);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);

    const validEmotions = ["sad", "happy", "angry", "neutral", null];
    if (!["chat", "emotion"].includes(parsed.type)) parsed.type = "chat";
    if (!validEmotions.includes(parsed.emotion)) parsed.emotion = "neutral";
    if (!parsed.reply) parsed.reply = "I am here for you 🎵";
    if (typeof parsed.suggestSongs !== "boolean") parsed.suggestSongs = parsed.type === "emotion";

    console.log("✅ OpenAI parsed:", parsed);
    return parsed;

  } catch (error) {
    console.error("❌ OpenAI error:", error.message);

    const text = message.toLowerCase();

    const greetings = ["hi", "hey", "hello", "hii", "wassup", "sup", "yo"];
    const endWords = ["thanks", "thank you", "bye", "goodbye"];
    const playTriggers = ["play", "song", "music", "suggest", "give me"];
    const aboutYou = ["what about you", "how about you", "how are you", "and you"];
    const sadWords = ["sad", "depress", "low", "lonely", "cry", "hopeless", "empty", "broken", "hurt", "miss", "lost", "bad day", "overwhelm", "upset", "tired", "anxious", "not okay"];
    const happyWords = ["happy", "excited", "amazing", "great", "awesome", "promot", "celebrat", "love", "blessed", "fantastic", "best day"];
    const angryWords = ["angry", "furious", "mad", "frustrated", "irritat", "annoy", "hate", "fed up", "stress"];
    const neutralWords = ["fine", "okay", "ok", "meh", "bored", "chilling", "aacha", "hmm", "whatever", "idk", "alright"];

    if (aboutYou.some(w => text.includes(w))) {
      return { type: "chat", emotion: null, reply: "Just vibing and loading playlists 🎧 What about you?", suggestSongs: false };
    }
    if (playTriggers.some(w => text.includes(w))) {
      return { type: "emotion", emotion: "neutral", reply: "Here you go 🎵 Let me set the vibe!", suggestSongs: true };
    }
    if (greetings.some(g => text.includes(g))) {
      return { type: "chat", emotion: null, reply: "Heyyy! 👋 What is the vibe today?", suggestSongs: false };
    }
    if (endWords.some(w => text.includes(w))) {
      return { type: "chat", emotion: null, reply: "Anytime! Come back whenever you need a vibe 🎵", suggestSongs: false };
    }
    if (sadWords.some(w => text.includes(w))) {
      return { type: "emotion", emotion: "sad", reply: "That sounds heavy 💙 Here is something for you.", suggestSongs: true };
    }
    if (happyWords.some(w => text.includes(w))) {
      return { type: "emotion", emotion: "happy", reply: "Love that energy! 🌟 Here is a banger!", suggestSongs: true };
    }
    if (angryWords.some(w => text.includes(w))) {
      return { type: "emotion", emotion: "angry", reply: "Let music help you breathe 💪", suggestSongs: true };
    }
    if (neutralWords.some(w => text.includes(w))) {
      return { type: "emotion", emotion: "neutral", reply: "Here is something chill for you 😌", suggestSongs: true };
    }

    return { type: "emotion", emotion: "neutral", reply: "Let me set the vibe for you 🎵", suggestSongs: true };
  }
};

module.exports = { analyzeMessage };