// src/features/facebook.js
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import ytdlpExec from 'yt-dlp-exec';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleFacebookDownloader(sock, from, url) {
  if (!url.startsWith('http')) {
    await sock.sendMessage(from, { text: '❌ URL tidak valid' });
    return;
  }

  await sock.sendMessage(from, { text: '📥 Mengunduh video Facebook...' });

  const tempFile = `${__dirname}/tmp_fb.mp4`;

  try {
    await ytdlpExec(url, { output: tempFile, format: 'mp4' });

    await sock.sendMessage(from, {
      video: fs.readFileSync(tempFile),
      mimetype: 'video/mp4',
      caption: '📹 Facebook Video',
    });

    fs.unlinkSync(tempFile);
  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: '❌ Gagal mengunduh video Facebook' });
  }
}