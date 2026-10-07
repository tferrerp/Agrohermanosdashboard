// Une src/shell.html + src/app.js en un solo archivo:
// - tablero.html: la página que se publica en Claude.
// - google/tablero-agrohermanos.html: la misma página para la versión de Google (Apps Script).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const shell = readFileSync(new URL('./src/shell.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('./src/app.js', import.meta.url), 'utf8');
if (!shell.includes('/*__APP__*/')) throw new Error('Falta el marcador /*__APP__*/ en src/shell.html');
const out = shell.replace('/*__APP__*/', () => app.replace(/<\/script/gi, '<\\/script'));
writeFileSync(new URL('./tablero.html', import.meta.url), out);
const google = `<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n${out}\n</body>\n</html>\n`;
mkdirSync(new URL('./google/', import.meta.url), { recursive: true });
writeFileSync(new URL('./google/tablero-agrohermanos.html', import.meta.url), google);
console.log(`tablero.html listo (${(out.length / 1024).toFixed(1)} KB) · google/tablero-agrohermanos.html listo`);
