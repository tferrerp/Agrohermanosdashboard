/**
 * Tablero Agrohermanos · servidor en Google Apps Script
 *
 * - Muestra el tablero: la versión más reciente publicada en GitHub (así Claude lo actualiza sin que vuelvas a publicar).
 *   Si GitHub no responde, usa el archivo "tablero-agrohermanos.html" más reciente de tu Drive.
 * - Guarda los datos en la hoja de cálculo "Tablero Agrohermanos · datos" (una pestaña por tipo de registro).
 * - Carga solo los registros que Claude deja en la carpeta "Tablero Agrohermanos · entradas".
 *
 * Pega este código en Extensiones → Apps Script de la hoja de datos y publícalo como aplicación web
 * (Ejecutar como: yo · Quién tiene acceso: solo yo).
 */

const SHEET_ID = '__SHEET_ID__';
const HTML_URL = 'https://raw.githubusercontent.com/tferrerp/Agrohermanosdashboard/claude/agrohermanos-dashboard-z6gqsc/google/tablero-agrohermanos.html';
const HTML_NAME = 'tablero-agrohermanos.html';
// Ícono de la pestaña: el isotipo de Agrohermanos.
const ICONO_URL = 'https://raw.githubusercontent.com/tferrerp/Agrohermanosdashboard/claude/agrohermanos-dashboard-z6gqsc/google/isotipo.png';
const NOMBRE_HOJA = 'Tablero Agrohermanos · datos';
const ENTRADAS = 'Tablero Agrohermanos · entradas';
const PROCESADOS = 'Tablero Agrohermanos · entradas procesadas';
const COPIAS = 'Tablero Agrohermanos · copias';
const FOTOS = 'Tablero Agrohermanos · comprobantes';
const COLS = ['listas', 'clientes', 'ventas', 'abonos', 'anticipos', 'bbDespachos', 'bbVentas', 'bbPagos', 'pineraCompras', 'pineraPagos', 'gastos', 'nomina'];
// Pestañas que no son registros.
const RESERVADAS = ['config'];
const ENCABEZADO = ['id', 'fecha', 'resumen', 'datos'];

function doGet() {
  const out = HtmlService.createHtmlOutput(ultimoHtml_())
    .setTitle('Tablero Agrohermanos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
  try { out.setFaviconUrl(ICONO_URL); } catch (e) { /* sin ícono, el tablero igual abre */ }
  return out;
}

// La versión más nueva del tablero: primero GitHub, si no, el archivo más reciente con ese nombre en tu Drive.
function ultimoHtml_() {
  try {
    const r = UrlFetchApp.fetch(HTML_URL, { muteHttpExceptions: true });
    if (r.getResponseCode() === 200) {
      const t = r.getContentText('UTF-8');
      if (t.indexOf('Tablero Agrohermanos') >= 0) return t;
    }
  } catch (e) { /* sigue con Drive */ }
  const it = DriveApp.getFilesByName(HTML_NAME);
  let mejor = null;
  while (it.hasNext()) {
    const f = it.next();
    if (f.isTrashed()) continue;
    if (!mejor || f.getDateCreated() > mejor.getDateCreated()) mejor = f;
  }
  if (!mejor) return '<p style="font-family:sans-serif;padding:24px">No pude cargar el tablero. Revisa tu conexión y recarga la página.</p>';
  return mejor.getBlob().getDataAsString('UTF-8');
}

// La hoja de datos: la que tiene este código (Extensiones → Apps Script) o, si no, la que se llama NOMBRE_HOJA.
function libro_() {
  if (SHEET_ID && SHEET_ID.indexOf('__') !== 0) return SpreadsheetApp.openById(SHEET_ID);
  const activo = SpreadsheetApp.getActiveSpreadsheet();
  if (activo) return activo;
  const it = DriveApp.getFilesByName(NOMBRE_HOJA);
  while (it.hasNext()) {
    const f = it.next();
    if (!f.isTrashed() && f.getMimeType() === MimeType.GOOGLE_SHEETS) return SpreadsheetApp.openById(f.getId());
  }
  throw new Error('No encontré la hoja "' + NOMBRE_HOJA + '" en tu Drive.');
}

function hoja_(libro, nombre) {
  let h = libro.getSheetByName(nombre);
  if (!h) {
    h = libro.insertSheet(nombre);
    h.getRange('A:D').setNumberFormat('@');
    h.getRange(1, 1, 1, ENCABEZADO.length).setValues([ENCABEZADO]).setFontWeight('bold');
    h.setFrozenRows(1);
    h.setColumnWidth(1, 160);
    h.setColumnWidth(2, 100);
    h.setColumnWidth(3, 420);
    h.setColumnWidth(4, 300);
  }
  return h;
}

function leerHoja_(h) {
  const n = h.getLastRow();
  if (n < 2) return [];
  return h.getRange(2, 1, n - 1, 4).getValues()
    .filter(function (r) { return r[0] !== '' && r[3] !== ''; })
    .map(function (r) {
      const d = JSON.parse(r[3]);
      d.id = String(r[0]);
      return d;
    });
}

function escribir_(h, id, json, resumen) {
  const d = JSON.parse(json);
  const fila = [String(id), String(d.fecha || ''), String(resumen || ''), json];
  const n = h.getLastRow();
  if (n >= 2) {
    const ids = h.getRange(2, 1, n - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) {
        h.getRange(i + 2, 1, 1, 4).setValues([fila]);
        return;
      }
    }
  }
  h.getRange(n + 1, 1, 1, 4).setNumberFormat('@').setValues([fila]);
}

// Cualquier nombre simple sirve: así el tablero puede agregar tipos de registro sin cambiar este código.
function colValida_(col) {
  return /^[A-Za-z][A-Za-z0-9]{1,40}$/.test(String(col)) && RESERVADAS.indexOf(col) < 0;
}
function validarCol_(col) {
  if (!colValida_(col)) throw new Error('Tipo de registro desconocido: ' + col);
}

function conCandado_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

/* ---------- Funciones que llama el tablero ---------- */

function cargarTodo() {
  const libro = libro_();
  prepararLibro_(libro);
  const importados = importarEntradas_(libro);
  const out = { sheetUrl: libro.getUrl(), importados: importados };
  const nombres = COLS.slice();
  libro.getSheets().forEach(function (h) { const nm = h.getName(); if (colValida_(nm) && nombres.indexOf(nm) < 0) nombres.push(nm); });
  nombres.forEach(function (c) { out[c] = leerHoja_(hoja_(libro, c)); });
  const cfg = hoja_(libro, 'config');
  const v = cfg.getLastRow() >= 2 ? cfg.getRange(2, 4).getValue() : '';
  out.config = v ? JSON.parse(v) : {};
  return JSON.stringify(out);
}

function guardar(col, id, json, resumen) {
  validarCol_(col);
  conCandado_(function () { escribir_(hoja_(libro_(), col), id, json, resumen); });
  return true;
}

function borrar(col, id) {
  validarCol_(col);
  conCandado_(function () {
    const h = hoja_(libro_(), col);
    const n = h.getLastRow();
    if (n < 2) return;
    const ids = h.getRange(2, 1, n - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === String(id)) h.deleteRow(i + 2);
  });
  return true;
}

function guardarConfig(json) {
  JSON.parse(json);
  conCandado_(function () {
    hoja_(libro_(), 'config').getRange(2, 1, 1, 4).setNumberFormat('@').setValues([['general', '', 'Configuración del tablero', json]]);
  });
  return true;
}

function guardarArchivo(nombre, texto) {
  const tipo = /\.csv$/i.test(nombre) ? MimeType.CSV : MimeType.PLAIN_TEXT;
  return carpeta_(COPIAS).createFile(nombre, texto, tipo).getUrl();
}

// Foto de un comprobante (llega en base64) a la carpeta de comprobantes de tu Drive.
function guardarImagen(nombre, base64, tipo) {
  if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(String(tipo))) throw new Error('Solo se pueden guardar fotos.');
  const limpio = String(nombre || 'comprobante.jpg').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 120);
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), tipo, limpio);
  return carpeta_(FOTOS).createFile(blob).getUrl();
}

/* ---------- Apoyo ---------- */

// Carpeta por nombre; si no existe, la crea junto a la hoja de datos.
function carpeta_(nombre) {
  const it = DriveApp.getFoldersByName(nombre);
  if (it.hasNext()) return it.next();
  const padres = DriveApp.getFileById(libro_().getId()).getParents();
  return padres.hasNext() ? padres.next().createFolder(nombre) : DriveApp.createFolder(nombre);
}

// La primera pestaña de una hoja nueva se vuelve una nota de qué es cada pestaña.
function prepararLibro_(libro) {
  if (libro.getSheetByName('Léeme')) return;
  const primera = libro.getSheets()[0];
  const h = primera && primera.getLastRow() === 0 ? primera.setName('Léeme') : libro.insertSheet('Léeme', 0);
  h.getRange(1, 1, 6, 1).setValues([
    ['Tablero Agrohermanos · datos'],
    ['Esta hoja guarda todo lo que registras en el tablero. Cada pestaña es un tipo de registro.'],
    ['La columna "resumen" es para leer; la columna "datos" es la que usa el tablero.'],
    ['Registra y edita desde el tablero, no a mano aquí, para que los cálculos no se dañen.'],
    [''],
    ['Pestañas: listas (precios), clientes, ventas, abonos, anticipos, bbDespachos, bbVentas, bbPagos, pineraCompras, pineraPagos, gastos, nomina, config.'],
  ]);
  h.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  h.setColumnWidth(1, 720);
}

// Lista definida como tarifa por rastra según el largo: precio = tarifa × (ancho × grueso × largo ÷ 240).
// tarifa: {"300": 196730, ...} con el largo en centímetros; medidas: ["4x6", ...].
function expandirTarifa_(tarifa, medidas) {
  const precios = {};
  medidas.forEach(function (m) {
    const p = String(m).split('x').map(Number);
    if (!(p[0] > 0 && p[1] > 0)) return;
    precios[m] = {};
    Object.keys(tarifa).forEach(function (cm) {
      precios[m][cm] = Math.round(Number(tarifa[cm]) * (p[0] * p[1] * (Number(cm) / 100) / 240));
    });
  });
  return precios;
}

// Registros que Claude deja como archivos JSON en la carpeta de entradas.
// Formato: {"ventas":[{...,"id":"..."}], "abonos":[...], "config":{...}}
function importarEntradas_(libro) {
  const it = DriveApp.getFoldersByName(ENTRADAS);
  if (!it.hasNext()) return 0;
  const carpeta = it.next();
  const archivos = carpeta.getFiles();
  if (!archivos.hasNext()) return 0;
  return conCandado_(function () {
    let total = 0;
    const listos = carpeta_(PROCESADOS);
    // Del más viejo al más nuevo, para que una corrección posterior quede encima de la anterior.
    const lista = [];
    while (archivos.hasNext()) lista.push(archivos.next());
    lista.sort(function (a, b) { return a.getDateCreated() - b.getDateCreated(); });
    lista.forEach(function (f) {
      let j;
      try { j = JSON.parse(f.getBlob().getDataAsString('UTF-8')); } catch (e) { return; }
      Object.keys(j).filter(colValida_).forEach(function (c) {
        (Array.isArray(j[c]) ? j[c] : []).forEach(function (rec) {
          if (!rec || !rec.id) return;
          const copia = JSON.parse(JSON.stringify(rec));
          const resumen = copia._resumen || '';
          delete copia.id;
          delete copia._resumen;
          if (c === 'listas' && copia.tarifa && Array.isArray(copia.medidas) && !copia.precios) copia.precios = expandirTarifa_(copia.tarifa, copia.medidas);
          escribir_(hoja_(libro, c), String(rec.id), JSON.stringify(copia), resumen);
          total++;
        });
      });
      if (j.config && typeof j.config === 'object') {
        const h = hoja_(libro, 'config');
        const actual = h.getLastRow() >= 2 && h.getRange(2, 4).getValue() ? JSON.parse(h.getRange(2, 4).getValue()) : {};
        const nueva = Object.assign({}, actual, j.config);
        h.getRange(2, 1, 1, 4).setNumberFormat('@').setValues([['general', '', 'Configuración del tablero', JSON.stringify(nueva)]]);
      }
      f.moveTo(listos);
    });
    return total;
  });
}
