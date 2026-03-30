const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const audioDir = path.join(publicDir, 'audio');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);

const pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const pngBuffer = Buffer.from(pngBase64, 'base64');

fs.writeFileSync(path.join(publicDir, 'logo192.png'), pngBuffer);
fs.writeFileSync(path.join(publicDir, 'logo512.png'), pngBuffer);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#FF9933" /><text x="100" y="120" font-family="sans-serif" font-size="80" fill="white" text-anchor="middle">BG</text></svg>`;
fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);

const mp3Hex = "FFFBA00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
const mp3Buffer = Buffer.from(mp3Hex, 'hex');

fs.writeFileSync(path.join(audioDir, 'ch1_sh1.mp3'), mp3Buffer);
fs.writeFileSync(path.join(audioDir, 'ch2_sh47.mp3'), mp3Buffer);
fs.writeFileSync(path.join(audioDir, 'ch4_sh7.mp3'), mp3Buffer);

console.log("Mock assets generated successfully.");
