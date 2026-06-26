import { readFileSync } from 'fs';
const css = readFileSync('src/css/components.css', 'utf-8');
const global = readFileSync('src/css/global.css', 'utf-8');
const pages = readFileSync('src/css/pages.css', 'utf-8');
console.log('Disabled button styles:', css.includes(':disabled') || global.includes(':disabled') || pages.includes(':disabled'));
