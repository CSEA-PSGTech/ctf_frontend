const fs = require('fs');
const src = 'c:/Users/Tejas/OneDrive/ドキュメント/Github works/ctf_frontend/ctf/public/ctf-logo.jpg';
const b64 = fs.readFileSync(src).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image href="data:image/jpeg;base64,${b64}" width="1024" height="1024" />
</svg>
`;
fs.writeFileSync('c:/Users/Tejas/OneDrive/ドキュメント/Github works/ctf_frontend/ctf/public/vite.svg', svg);
console.log('vite.svg successfully replaced!');

