const fs = require('fs');

async function main() {
  try {
    const res = await fetch('https://lienquan.garena.vn/tuong', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await res.text();
    const matches = text.match(/https?:\/\/[^"'\s)]+\.(jpg|png|webp|jpeg)/gi) || [];
    console.log('Found', matches.length, 'images on lienquan.garena.vn');
    const filtered = matches.filter(u => u.includes('tuong') || u.includes('skin') || u.includes('champion') || u.includes('hero') || u.includes('cdn'));
    console.log('Sample filtered:', filtered.slice(0, 15));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
