// src/handler.js

/* WADUH... MAU NGAPAIN BANG?
KALAU MAU PAKE, MINIMAL FOLLOW DAN KASIH STAR!
https://github.com/atex-ovi
*/

import fs from 'fs';
import path from 'path';
import { userState } from './userState.js';
import { handleYouTubeDownloader } from './features/youtube.js';
import { handleFacebookDownloader } from './features/facebook.js';
import { handleInstagramDownloader } from './features/instagram.js';
import { handleTikTokDownloader } from './features/tiktok.js';
import { validateUrl } from './utils/validateUrl.js';

const menuImagePath = path.join(process.cwd(), 'src/assets/menu.jpg');

export async function handler(sock, msg) {
  if (!msg?.message) return;

  const from = msg.key.remoteJid;
  const state = userState.get(from) || { step: 'start' };

  const text =
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    msg.message?.videoMessage?.caption;

  let rowId;
  try {
    if (msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
      rowId = JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
    } else if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
      rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
    }
  } catch (err) {
    console.error('[DEBUG] Gagal parsing rowId:', err);
  }

  const btnId = msg.message?.buttonsResponseMessage?.selectedButtonId;
  if (btnId === 'back_to_menu') {
    await sock.sendPresenceUpdate('composing', from);
    await new Promise(r => setTimeout(r, 800));

    await sendDownloaderMenu(sock, from);

    await sock.sendPresenceUpdate('paused', from);
    userState.set(from, { step: 'menuMain' });
    return;
  }

  if (rowId) {
    switch (rowId) {
      case 'yt_downloader':
        userState.set(from, { step: 'yt_wait_url' });
        await sock.sendMessage(from, { text: '📌 Kirim link *YouTube* yang ingin diunduh:' });
        break;
      case 'fb_downloader':
        userState.set(from, { step: 'fb_wait_url' });
        await sock.sendMessage(from, { text: '📌 Kirim link *Facebook* video:' });
        break;
      case 'ig_downloader':
        userState.set(from, { step: 'ig_wait_url' });
        await sock.sendMessage(from, { text: '📌 Kirim link *Instagram* video:' });
        break;
      case 'tt_downloader':
        userState.set(from, { step: 'tt_wait_url' });
        await sock.sendMessage(from, { text: '📌 Kirim link *TikTok* video:' });
        break;
      default:
        break;
    }
    return;
  }

  if (text) {
    switch (state.step) {
      case 'yt_wait_url':
        if (!validateUrl(text, 'youtube')) {
          await sock.sendMessage(from, { 
            text: '❌ URL tidak valid, silakan kirim link YouTube yang benar.',
            buttons: [{ buttonId: 'back_to_menu', buttonText: { displayText: 'Kembali ke Menu' }, type: 1 }]
          });
          return;
        }
        await handleYouTubeDownloader(sock, from, text);
        break;

      case 'fb_wait_url':
        if (!validateUrl(text, 'facebook')) {
          await sock.sendMessage(from, { 
            text: '❌ URL tidak valid, silakan kirim link Facebook yang benar.',
            buttons: [{ buttonId: 'back_to_menu', buttonText: { displayText: 'Kembali ke Menu' }, type: 1 }]
          });
          return;
        }
        await handleFacebookDownloader(sock, from, text);
        break;

      case 'ig_wait_url':
        if (!validateUrl(text, 'instagram')) {
          await sock.sendMessage(from, { 
            text: '❌ URL tidak valid, silakan kirim link Instagram yang benar.',
            buttons: [{ buttonId: 'back_to_menu', buttonText: { displayText: 'Kembali ke Menu' }, type: 1 }]
          });
          return;
        }
        await handleInstagramDownloader(sock, from, text);
        break;

      case 'tt_wait_url':
        if (!validateUrl(text, 'tiktok')) {
          await sock.sendMessage(from, { 
            text: '❌ URL tidak valid, silakan kirim link TikTok yang benar.',
            buttons: [{ buttonId: 'back_to_menu', buttonText: { displayText: 'Kembali ke Menu' }, type: 1 }]
          });
          return;
        }
        await handleTikTokDownloader(sock, from, text);
        break;

      default:
        await sendDownloaderMenu(sock, from);
        break;
    }

    userState.set(from, { step: 'menuMain' });
    return;
  }

  if (state.step === 'start' || state.step === 'menuMain') {
    await sendDownloaderMenu(sock, from);
    userState.set(from, { step: 'menuMain' });
  }
}

export async function sendDownloaderMenu(sock, from) {
  await sock.sendMessage(from, {
    image: fs.readFileSync(menuImagePath),
    caption: '',
    footer: '© Atex Ovi 2025',
    interactiveButtons: [
      {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
          title: 'Video Downloader',
          sections: [
            {
              title: 'Pilih Platform',
              rows: [
                { title: 'YouTube Downloader', description: 'Unduh video dari YouTube', id: 'yt_downloader' },
                { title: 'Facebook Downloader', description: 'Unduh video dari Facebook', id: 'fb_downloader' },
                { title: 'Instagram Downloader', description: 'Unduh video dari Instagram', id: 'ig_downloader' },
                { title: 'TikTok Downloader', description: 'Unduh video dari TikTok', id: 'tt_downloader' },
              ],
            },
          ],
        }),
      },
    ],
  });
}
