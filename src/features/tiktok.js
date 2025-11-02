// src/features/tiktok.js
import fs from "fs";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";
import ytdlpExec from "yt-dlp-exec";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resolveTikTokUrl(url) {
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    return response.request.res.responseUrl || url;
  } catch (err) {
    console.error("❌ Gagal resolve TikTok URL:", err.message);
    return url;
  }
}

export async function handleTikTokDownloader(sock, from, url) {
  if (!url.startsWith("http")) {
    await sock.sendMessage(from, { text: "❌ URL tidak valid" });
    return;
  }

  await sock.sendMessage(from, { text: "📥 Mengunduh video TikTok..." });

  const tempFile = `${__dirname}/tmp_tt.mp4`;

  try {
    const resolvedUrl = await resolveTikTokUrl(url);
    await ytdlpExec(resolvedUrl, {
      output: tempFile,
      format: "bv*[height<=1080]+ba/bv*+ba/best",
      quiet: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    await sock.sendMessage(from, {
      video: fs.readFileSync(tempFile),
      mimetype: "video/mp4",
      caption: "📹 TikTok Video (No Watermark)",
    });

    fs.unlinkSync(tempFile);
  } catch (err) {
    console.error("❌ Error saat mengunduh TikTok:", err);
    await sock.sendMessage(from, {
      text: "❌ Gagal mengunduh video TikTok. Coba lagi dengan link lain.",
    });
  }
}
