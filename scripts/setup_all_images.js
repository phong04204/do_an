const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNTS_DIR = path.resolve(__dirname, '../frontend/public/images/accounts');
const CARDS_DIR = path.resolve(__dirname, '../frontend/public/images/cards');
const GIFTCODES_DIR = path.resolve(__dirname, '../frontend/public/images/giftcodes');

[ACCOUNTS_DIR, CARDS_DIR, GIFTCODES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to download ${url}: status ${res.status}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved ${destPath} (${buffer.length} bytes)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${url}:`, err.message);
    return false;
  }
}

// 1. SVG Card Generator for Telcos
function generateTelcoCardSvg(brand, amountStr, primaryColor, secondaryColor, logoText) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad_${brand}_${amountStr}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
    <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffd700"/>
      <stop offset="50%" stop-color="#fff275"/>
      <stop offset="100%" stop-color="#cca010"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect x="10" y="10" width="580" height="360" rx="24" fill="url(#bgGrad_${brand}_${amountStr})" filter="url(#shadow)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  
  <!-- Subtle decorative patterns -->
  <circle cx="520" cy="60" r="160" fill="white" fill-opacity="0.06"/>
  <circle cx="80" cy="320" r="120" fill="white" fill-opacity="0.04"/>
  <path d="M -20,200 Q 150,80 320,180 T 620,140" fill="none" stroke="white" stroke-opacity="0.08" stroke-width="40"/>

  <!-- Logo Section -->
  <g transform="translate(45, 45)">
    <text font-family="'Inter', sans-serif" font-weight="900" font-size="34" fill="#ffffff" letter-spacing="1">
      ${logoText}
    </text>
    <text y="28" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="#ffffff" fill-opacity="0.8" letter-spacing="3">
      PREPAID SCRATCH CARD
    </text>
  </g>

  <!-- Sim / Smart Chip -->
  <g transform="translate(45, 125)">
    <rect width="68" height="52" rx="8" fill="url(#chipGrad)" stroke="#aa8008" stroke-width="1.5"/>
    <line x1="0" y1="26" x2="68" y2="26" stroke="#aa8008" stroke-width="1.5"/>
    <line x1="24" y1="0" x2="24" y2="52" stroke="#aa8008" stroke-width="1.5"/>
    <line x1="44" y1="0" x2="44" y2="52" stroke="#aa8008" stroke-width="1.5"/>
    <circle cx="34" cy="26" r="8" fill="#ffd700" stroke="#aa8008" stroke-width="1.5"/>
  </g>

  <!-- Contactless NFC Icon -->
  <path d="M 135,135 A 15,15 0 0 1 135,165 M 145,127 A 25,25 0 0 1 145,173 M 155,119 A 35,35 0 0 1 155,181" 
        fill="none" stroke="white" stroke-opacity="0.5" stroke-width="2.5" stroke-linecap="round"/>

  <!-- Denomination Badge -->
  <g transform="translate(45, 230)">
    <text font-family="'Inter', sans-serif" font-weight="600" font-size="15" fill="#ffffff" fill-opacity="0.75" letter-spacing="1">
      MỆNH GIÁ THẺ
    </text>
    <text y="50" font-family="'Inter', sans-serif" font-weight="900" font-size="52" fill="#ffffff" letter-spacing="-1">
      ${amountStr}
    </text>
  </g>

  <!-- Fast Delivery Badge -->
  <g transform="translate(410, 275)">
    <rect width="145" height="42" rx="21" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
    <circle cx="22" cy="21" r="6" fill="#00ff88"/>
    <text x="38" y="27" font-family="'Inter', sans-serif" font-weight="700" font-size="14" fill="#ffffff">
      GIAO NGAY
    </text>
  </g>
</svg>`;
}

// 2. SVG Giftcode Generator
function generateGiftcodeSvg(title, gameName, codeType, tagColor, badgeText, iconSymbol) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
  <defs>
    <linearGradient id="gcBg_${gameName.replace(/\\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="accentGrad_${gameName.replace(/\\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${tagColor}"/>
      <stop offset="100%" stop-color="#ff007a"/>
    </linearGradient>
    <filter id="glow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${tagColor}" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect x="10" y="10" width="580" height="360" rx="24" fill="url(#gcBg_${gameName.replace(/\\s+/g, '')})" stroke="${tagColor}" stroke-width="2.5" stroke-opacity="0.6"/>
  
  <!-- Glowing borders and accents -->
  <rect x="25" y="25" width="550" height="330" rx="16" fill="none" stroke="white" stroke-opacity="0.05" stroke-dasharray="8 8"/>
  <circle cx="500" cy="90" r="140" fill="${tagColor}" fill-opacity="0.12" filter="blur(40px)"/>
  <circle cx="100" cy="300" r="110" fill="#a855f7" fill-opacity="0.1" filter="blur(30px)"/>

  <!-- Top Header -->
  <g transform="translate(45, 55)">
    <!-- Game Tag -->
    <rect width="130" height="32" rx="16" fill="${tagColor}" fill-opacity="0.25" stroke="${tagColor}" stroke-width="1.5"/>
    <text x="65" y="21" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="800" font-size="13" fill="#ffffff" letter-spacing="1">
      ${gameName.toUpperCase()}
    </text>
    
    <!-- Code Type -->
    <text x="145" y="22" font-family="'Inter', sans-serif" font-weight="600" font-size="14" fill="#94a3b8" letter-spacing="2">
      OFFICIAL GIFTCODE
    </text>
  </g>

  <!-- Center Icon / Symbol -->
  <g transform="translate(460, 160)" filter="url(#glow)">
    <circle cx="45" cy="45" r="45" fill="${tagColor}" fill-opacity="0.2" stroke="${tagColor}" stroke-width="2"/>
    <text x="45" y="58" text-anchor="middle" font-size="38" fill="#ffffff">${iconSymbol}</text>
  </g>

  <!-- Title & Description -->
  <g transform="translate(45, 140)">
    <text font-family="'Inter', sans-serif" font-weight="900" font-size="28" fill="#ffffff" width="380">
      ${title.length > 28 ? title.substring(0, 26) + '...' : title}
    </text>
    <text y="38" font-family="'Inter', sans-serif" font-weight="600" font-size="18" fill="${tagColor}">
      ${codeType}
    </text>
  </g>

  <!-- Scratch Box Preview -->
  <g transform="translate(45, 235)">
    <rect width="360" height="58" rx="12" fill="#0f172a" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
    <text x="20" y="36" font-family="'Courier New', monospace" font-weight="bold" font-size="20" fill="#38bdf8" letter-spacing="4">
      •••• •••• •••• ••••
    </text>
    <rect x="235" y="10" width="112" height="38" rx="8" fill="${tagColor}"/>
    <text x="291" y="34" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="700" font-size="13" fill="#ffffff">
      ${badgeText}
    </text>
  </g>

  <!-- Bottom notice -->
  <text x="45" y="335" font-family="'Inter', sans-serif" font-weight="500" font-size="12" fill="#64748b">
    * Mã code tự động gửi vào đơn hàng ngay sau khi thanh toán thành công
  </text>
</svg>`;
}

async function main() {
  console.log('--- Generating Telco Cards ---');
  // Mobifone
  fs.writeFileSync(path.join(CARDS_DIR, 'mobifone-100k.svg'), generateTelcoCardSvg('mobi', '100.000đ', '#005baa', '#e60012', 'mobifone'));
  fs.writeFileSync(path.join(CARDS_DIR, 'mobifone-200k.svg'), generateTelcoCardSvg('mobi', '200.000đ', '#004c8f', '#d00010', 'mobifone'));
  fs.writeFileSync(path.join(CARDS_DIR, 'mobifone-500k.svg'), generateTelcoCardSvg('mobi', '500.000đ', '#003a6e', '#b0000d', 'mobifone'));
  
  // Vinaphone
  fs.writeFileSync(path.join(CARDS_DIR, 'vinaphone-100k.svg'), generateTelcoCardSvg('vina', '100.000đ', '#00a1e4', '#005a9e', 'vinaphone'));
  fs.writeFileSync(path.join(CARDS_DIR, 'vinaphone-200k.svg'), generateTelcoCardSvg('vina', '200.000đ', '#008ec9', '#004377', 'vinaphone'));
  
  // Vietnamobile
  fs.writeFileSync(path.join(CARDS_DIR, 'vietnamobile-50k.svg'), generateTelcoCardSvg('vnm', '50.000đ', '#ff5a00', '#d83a00', 'vietnamobile'));
  fs.writeFileSync(path.join(CARDS_DIR, 'vietnamobile-100k.svg'), generateTelcoCardSvg('vnm', '100.000đ', '#ff4800', '#b82a00', 'vietnamobile'));
  console.log('Telco cards generated successfully.');

  console.log('--- Generating Dedicated Giftcodes Artwork ---');
  // 15 Giftcodes
  const giftcodes = [
    { file: 'gc_valo_champ.svg',   title: 'Champions 2026 Knife',  game: 'Valorant',    type: 'Vũ Khí Giới Hạn Exclusive', color: '#ff4655', badge: 'REDEEM', icon: '⚔️' },
    { file: 'gc_valo_vp.svg',      title: '2400 Valorant Points',  game: 'Valorant',    type: 'Gói Điểm VP Riot',         color: '#fa4454', badge: '2400 VP', icon: '💎' },
    { file: 'gc_valo_phantom.svg', title: 'Skin Phantom Đặc Biệt',  game: 'Valorant',    type: 'Vũ Khí Độc Quyền',         color: '#00f5d4', badge: 'SKIN VIP', icon: '🔫' },
    { file: 'gc_valo_clove.svg',   title: 'Mở Khoá Agent Clove',   game: 'Valorant',    type: 'Đặc Vụ Controller',        color: '#d946ef', badge: 'AGENT', icon: '🦋' },
    { file: 'gc_lmht_skin.svg',    title: 'Trang Phục Tự Chọn',    game: 'LMHT',        type: 'Skin Đặc Biệt Riot',        color: '#0ac8b9', badge: 'SKIN FREE', icon: '✨' },
    { file: 'gc_lmht_rp.svg',      title: '10.000 Riot Points',    game: 'LMHT',        type: 'Gói Điểm RP Siêu Cấp',      color: '#f59e0b', badge: '10.000 RP', icon: '🪙' },
    { file: 'gc_lmht_ashe.svg',    title: 'Prestige Ashe Giới Hạn',game: 'LMHT',        type: 'Trang Phục Hàng Hiệu',      color: '#c084fc', badge: 'PRESTIGE', icon: '🏹' },
    { file: 'gc_lmht_icon.svg',    title: 'Icon + Mẫu Mắt 2025',   game: 'LMHT',        type: 'Vật Phẩm Kỷ Niệm',         color: '#38bdf8', badge: 'EXCLUSIVE', icon: '🛡️' },
    { file: 'gc_ff_diamond.svg',   title: '500 Kim Cương Garena',  game: 'Free Fire',   type: 'Kim Cương Nạp Trực Tiếp',   color: '#06b6d4', badge: '500 💎', icon: '💎' },
    { file: 'gc_ff_elitepass.svg', title: 'Élite Pass Season 51',  game: 'Free Fire',   type: 'Vé Booyah Pass VIP',       color: '#f97316', badge: 'PASS PLUS', icon: '🎟️' },
    { file: 'gc_ff_m1887.svg',     title: 'Skin M1887 Rồng Vàng',  game: 'Free Fire',   type: 'Shotgun Tiến Hóa Cực Hiếm', color: '#eab308', badge: 'EVO GUN', icon: '🔥' },
    { file: 'gc_lq_voucher.svg',   title: 'Voucher 100K Quân Huy', game: 'Liên Quân',   type: 'Phiếu Giảm Giá Nạp Game',   color: '#3b82f6', badge: '100.000đ', icon: '🎫' },
    { file: 'gc_lq_florentino.svg',title: 'Florentino Tinh Hệ',    game: 'Liên Quân',   type: 'Trang Phục S+ Hữu Hạn',     color: '#8b5cf6', badge: 'SUPER VIP', icon: '🌹' },
    { file: 'gc_pubg_uc.svg',      title: '600 UC PUBG Mobile',    game: 'PUBG Mobile', type: 'Gói Unknown Cash Nạp Nhanh', color: '#10b981', badge: '600 UC', icon: '💵' },
    { file: 'gc_pubg_rp.svg',      title: 'Royale Pass Season 31', game: 'PUBG Mobile', type: 'Thẻ Royale Pass Elite',   color: '#ec4899', badge: 'RP ELITE', icon: '👑' },
  ];

  giftcodes.forEach(gc => {
    fs.writeFileSync(
      path.join(GIFTCODES_DIR, gc.file),
      generateGiftcodeSvg(gc.title, gc.game, gc.type, gc.color, gc.badge, gc.icon)
    );
  });
  console.log('15 Giftcode cards generated.');

  console.log('--- Downloading Game Account Images ---');
  // Download verified assets for accounts
  const downloads = [
    // AoV / Liên Quân
    { url: 'https://wallpaperaccess.com/full/1507727.jpg', dest: path.join(ACCOUNTS_DIR, 'lq_florentino.jpg') },
    { url: 'https://wallpaperaccess.com/full/1507729.jpg', dest: path.join(ACCOUNTS_DIR, 'lq_nakroth.jpg') },
    // PUBG Mobile
    { url: 'https://wallpaperaccess.com/full/1126743.jpg', dest: path.join(ACCOUNTS_DIR, 'pubg_m416_glacier.jpg') },
    { url: 'https://wallpaperaccess.com/full/1126747.jpg', dest: path.join(ACCOUNTS_DIR, 'pubg_awm_dragon.jpg') },
    { url: 'https://wallpaperaccess.com/full/1126768.jpg', dest: path.join(ACCOUNTS_DIR, 'pubg_conqueror.jpg') },
    // Free Fire Elite Pass
    { url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', dest: path.join(ACCOUNTS_DIR, 'ff_elite_pass.jpg') },
  ];

  for (const d of downloads) {
    await downloadFile(d.url, d.dest);
  }

  console.log('All image assets created and verified successfully!');
}

main();
