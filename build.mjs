// Une src/shell.html + src/app.js en un solo archivo: tablero.html
import { readFileSync, writeFileSync } from 'node:fs';
const shell = readFileSync(new URL('./src/shell.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./src/app.js', import.meta.url), 'utf8');
if (!shell.includes('/*__APP__*/')) throw new Error('Falta el marcador /*__APP__*/ en src/shell.html');
const out = shell.replace('/*__APP__*/', () => app.replace(/<\/script/gi, '<\\/script'));
writeFileSync(new URL('./tablero.html', import.meta.url), out);
console.log(`tablero.html listo (${(out.length / 1024).toFixed(1)} KB)`);
