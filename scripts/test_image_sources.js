const fs = require('fs');

const candidates = [
  // Free Fire
  { name: 'ff_elite_pass', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80' },
  // Liên Quân / AoV
  { name: 'lq_wallpaper_1', url: 'https://wallpaperaccess.com/full/1507727.jpg' },
  { name: 'lq_wallpaper_2', url: 'https://wallpaperaccess.com/full/1507729.jpg' },
  { name: 'lq_wallpaper_3', url: 'https://wallpaperaccess.com/full/1507736.jpg' },
  { name: 'lq_wallpaper_4', url: 'https://wallpaperaccess.com/full/1507740.jpg' },
  // PUBG Mobile
  { name: 'pubg_wallpaper_1', url: 'https://wallpaperaccess.com/full/1126743.jpg' },
  { name: 'pubg_wallpaper_2', url: 'https://wallpaperaccess.com/full/1126747.jpg' },
  { name: 'pubg_wallpaper_3', url: 'https://wallpaperaccess.com/full/1126768.jpg' },
  { name: 'pubg_wallpaper_4', url: 'https://wallpaperaccess.com/full/1126780.jpg' },
  { name: 'pubg_wallpaper_5', url: 'https://wallpaperaccess.com/full/1126795.jpg' },
  // Riot Games ddragon
  { name: 'lmht_yasuo', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_9.jpg' },
  { name: 'lmht_lucian', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lucian_6.jpg' },
  { name: 'lmht_leesin', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/LeeSin_4.jpg' },
  { name: 'lmht_blitz', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Blitzcrank_29.jpg' },
  { name: 'lmht_ahri', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_14.jpg' },
  { name: 'lmht_aatrox', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_7.jpg' },
  { name: 'lmht_yone', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yone_4.jpg' },
  { name: 'lmht_jinx', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_37.jpg' },
  { name: 'lmht_garen', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg' },
  { name: 'lmht_ashe', url: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ashe_0.jpg' },
  { name: 'lmht_hextech', url: 'https://ddragon.leagueoflegends.com/cdn/14.5.1/img/item/1001.png' },
  // Valorant API
  { name: 'valo_reaver', url: 'https://media.valorant-api.com/playercards/8bbdc250-4ffc-f6ba-61a0-0d84c4756a4e/wideart.png' },
  { name: 'valo_prime', url: 'https://media.valorant-api.com/playercards/d93ad22d-4db7-b6bc-5e9c-e5959bb9dd76/wideart.png' },
  { name: 'valo_kuronami', url: 'https://media.valorant-api.com/playercards/1a127cbf-4131-3581-da59-529b7e0d9495/wideart.png' },
  { name: 'valo_champ', url: 'https://media.valorant-api.com/playercards/b56b2bee-4c04-89ea-370c-37a7dd1c11e4/wideart.png' },
  { name: 'valo_jett', url: 'https://media.valorant-api.com/playercards/1fb0bee0-49db-fb51-b090-bc834babdb2b/wideart.png' },
  { name: 'valo_phoenix', url: 'https://media.valorant-api.com/playercards/3432dc3d-47da-4675-67ae-53adb1fdad5e/wideart.png' },
  { name: 'valo_rgx', url: 'https://media.valorant-api.com/playercards/cada2e3f-4b1d-8279-3e1a-49984a71d4d3/wideart.png' },
  { name: 'valo_magepunk', url: 'https://media.valorant-api.com/playercards/fb7b9264-42b7-a377-a85c-15a9ab2dc31d/wideart.png' },
  { name: 'valo_clove', url: 'https://media.valorant-api.com/playercards/44e4776a-464a-251d-d2e3-68936998d30e/wideart.png' }
];

async function run() {
  for (const c of candidates) {
    try {
      const res = await fetch(c.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const len = res.headers.get('content-length') || 0;
      console.log(`[${res.status}] ${c.name} (${len} bytes)`);
    } catch (e) {
      console.log(`[ERR] ${c.name}: ${e.message}`);
    }
  }
}

run();
