import { readFileSync } from 'fs';
const html = readFileSync('index.html', 'utf-8');
console.log('Index HTML:');
console.log(html);
