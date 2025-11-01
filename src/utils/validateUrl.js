// src/utils/validateUrl.js
export function validateUrl(url, platform) {
  if (typeof url !== 'string') return false;

  const patterns = {
    youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
    facebook: /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/,
    instagram: /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/.+$/,
    tiktok: /^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/
  };

  if (!patterns[platform]) return false;

  return patterns[platform].test(url);
}