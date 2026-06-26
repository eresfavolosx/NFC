import { readFileSync } from 'fs';
const componentsCss = readFileSync('src/css/components.css', 'utf-8');
const hasDisabledStyle = componentsCss.includes(':disabled');
console.log('Has disabled style:', hasDisabledStyle);
