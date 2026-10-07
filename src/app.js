(() => {
'use strict';

/* =========================================================================
   Utilidades
   ========================================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = v => { const x = +v; return Number.isFinite(x) ? x : 0; };
const sum = (arr, f) => arr.reduce((a, x) => a + n(f ? f(x) : x), 0);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clone = o => JSON.parse(JSON.stringify(o));

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const pad = x => String(x).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const toD = s => new Date(s + 'T00:00:00Z');
const fromD = d => d.toISOString().slice(0, 10);
const addDays = (s, k) => { const d = toD(s); d.setUTCDate(d.getUTCDate() + k); return fromD(d); };
const diffDays = (a, b) => Math.round((toD(b) - toD(a)) / 864e5);
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));
const fmtDate = s => { if (!isDate(s)) return '—'; const d = toD(s); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const fmtDay = s => { const d = toD(s); return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`; };
const mondayOf = s => { const d = toD(s); const wd = (d.getUTCDay() + 6) % 7; return addDays(s, -wd); };

function cop(v, compact) {
  v = n(v);
  const s = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (compact) {
    if (a >= 1e9) return `${s}$${(a / 1e9).toLocaleString('es-CO', { maximumFractionDigits: 2 })} mil M`;
    if (a >= 1e6) return `${s}$${(a / 1e6).toLocaleString('es-CO', { maximumFractionDigits: a >= 1e8 ? 0 : 1 })} M`;
    if (a >= 1e3) return `${s}$${Math.round(a / 1e3).toLocaleString('es-CO')} mil`;
  }
  return `${s}$${Math.round(a).toLocaleString('es-CO')}`;
}
const num = (v, d = 2) => n(v).toLocaleString('es-CO', { maximumFractionDigits: d });
const pct = v => Number.isFinite(v) ? `${(v * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%` : '—';
const parseMoney = s => { const t = String(s ?? '').replace(/[^\d-]/g, ''); return t && t !== '-' ? +t : 0; };
const parseQty = s => {
  let t = String(s ?? '').trim().replace(/\s/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const x = parseFloat(t);
  return Number.isFinite(x) ? x : 0;
};
const moneyIn = v => (n(v) ? Math.round(n(v)).toLocaleString('es-CO') : '');
const qtyIn = v => (n(v) ? String(+n(v).toFixed(4)).replace('.', ',') : '');

/* =========================================================================
   Iconos (trazo fino)
   ========================================================================= */
const IC = {
  resumen: '<path d="M2.5 13.5h11M4 11V7M7 11V4M10 11V8M13 11V5.5"/>',
  mayoristas: '<path d="M2 6.5 8 3l6 3.5M3.5 7v6h9V7M6.5 13V9.5h3V13"/>',
  bb: '<path d="M3 3.5h10v9H3zM3 7h10M6.5 3.5V7M9.5 3.5V7"/>',
  final: '<circle cx="8" cy="5.5" r="2.5"/><path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4"/>',
  pinera: '<path d="M8 2.5 4 8h2.2L3.5 12h9L9.8 8H12L8 2.5zM8 12v2"/>',
  gastos: '<path d="M3 4.5h10v8H3zM3 7h10M10 10h1.5"/>',
  catalogo: '<path d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"/>',
  datos: '<path d="M3 4.5c0-1 2.2-1.8 5-1.8s5 .8 5 1.8v7c0 1-2.2 1.8-5 1.8s-5-.8-5-1.8zM3 4.5c0 1 2.2 1.8 5 1.8s5-.8 5-1.8M3 8c0 1 2.2 1.8 5 1.8s5-.8 5-1.8"/>',
  check: '<path d="M3.5 8.5 6.5 11.5 12.5 4.5"/>',
  clock: '<circle cx="8" cy="8" r="5.5"/><path d="M8 5v3.2l2 1.3"/>',
  alert: '<path d="M8 2.5 14 13H2zM8 6.5v3M8 11.2v.3"/>',
  info: '<circle cx="8" cy="8" r="5.5"/><path d="M8 7.2V11M8 5v.3"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  x: '<path d="M4 4l8 8M12 4l-8 8"/>',
  down: '<path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3 13.5h10"/>',
  up: '<path d="M8 13V5M4.5 8.5 8 5l3.5 3.5M3 2.5h10"/>',
  edit: '<path d="M10.5 3 13 5.5 6 12.5H3.5V10z"/>',
};
const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;

/* =========================================================================
   Modelo de datos
   ========================================================================= */
const COLS = ['listas', 'clientes', 'ventas', 'abonos', 'bbDespachos', 'bbVentas', 'bbPagos', 'pineraCompras', 'pineraPagos', 'gastos'];
// Costo de la pinera por rastra según el largo (tabla 2026) + mano de obra por rastra.
const PINERA_2026 = [
  [1.4, 125730], [3.4, 125730], [3.9, 132715], [4.4, 144780], [4.9, 159258], [5.4, 176784], [5.9, 184912],
  [6.4, 199136], [6.9, 210000], [7.4, 228600], [7.9, 241808], [8.4, 285750], [8.9, 301625], [9.4, 317500],
  [9.9, 333375], [10.4, 345875], [10.9, 358375], [11.4, 370875], [11.9, 383375], [12.5, 395875],
].map(([hasta, valor]) => ({ hasta, valor }));
const DEFAULT_CONFIG = {
  socio: 'Rubén', punto: 'Barro Blanco', pctSocio: 50, diasCredito: 30, stockMin: 3,
  pinera: PINERA_2026, aserrada: 58000, arriada: 6000, listaBB: '', listaFinal: '',
};
const MEDIOS = ['Transferencia', 'Efectivo', 'Consignación', 'Otro'];
const GASTO_CATS = ['Flete', 'Cargue', 'Combustible', 'Aserrío', 'Arriería', 'Inmunización', 'Herramientas', 'Comisiones', 'Otro'];
const GASTO_CANAL = ['General', 'Mayoristas', 'Barro Blanco', 'Cliente final', 'Producción'];
const PINERA_CONCEPTOS = ['Madera', 'Aserrío', 'Flete', 'Otro cargo'];
const ESTADOS_FINAL = ['Pendiente', 'Despachado', 'Entregado'];
const CANAL = {
  mayorista: { label: 'Mayoristas', color: 'var(--s1)' },
  bb: { label: 'Barro Blanco', color: 'var(--s2)' },
  final: { label: 'Cliente final', color: 'var(--s3)' },
};

const VIEWS = [
  { id: 'resumen', label: 'Resumen', icon: 'resumen', group: 'Negocio' },
  { id: 'mayoristas', label: 'Mayoristas', icon: 'mayoristas', group: 'Ventas' },
  { id: 'bb', label: 'Barro Blanco', icon: 'bb', group: 'Ventas' },
  { id: 'final', label: 'Cliente final', icon: 'final', group: 'Ventas' },
  { id: 'pinera', label: 'La Pinera', icon: 'pinera', group: 'Costos' },
  { id: 'gastos', label: 'Gastos', icon: 'gastos', group: 'Costos' },
  { id: 'precios', label: 'Precios y costos', icon: 'catalogo', group: 'Ajustes' },
  { id: 'datos', label: 'Datos', icon: 'datos', group: 'Ajustes' },
];

const RANGES = [
  ['hoy', 'Hoy'], ['7d', '7 días'], ['15d', '15 días'], ['30d', '30 días'],
  ['mes', 'Este mes'], ['mesant', 'Mes anterior'], ['ano', 'Este año'], ['todo', 'Todo'], ['custom', 'Personalizado'],
];

const S = {
  mode: 'loading',          // loading | db | local
  data: Object.fromEntries(COLS.map(c => [c, []])),
  loaded: new Set(),
  config: { ...DEFAULT_CONFIG },
  demo: false,
  view: 'resumen',
  range: 'mes',
  customFrom: '', customTo: '',
  filterCli: '',            // filtro de cliente en mayoristas
  ver: 0,
  form: null,
  readOnly: false,
};

const pref = {
  get(k, d) { try { const v = localStorage.getItem('agh.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('agh.' + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

const D = () => (S.demo ? DEMO.data : S.data);
const CFG = () => (S.demo ? { ...DEFAULT_CONFIG } : S.config);

/* =========================================================================
   Almacenamiento: base de datos de Claude (db) o, si no existe, este navegador
   ========================================================================= */
const LOCAL_KEY = 'agh.data.v1';
const Store = {
  db: null,
  async init() {
    let db = null;
    try {
      if (window.claude && typeof window.claude.use === 'function') db = await window.claude.use('db');
    } catch { db = null; }
    if (db) {
      this.db = db; S.mode = 'db'; this.subscribe();
    } else {
      S.mode = 'local'; this.loadLocal();
    }
    bump();
  },
  subscribe() {
    for (const c of COLS) {
      this.db.collection(c).onSnapshot(snap => {
        S.data[c] = snap.docs.map(d => ({ ...d.data(), id: d.id }));
        S.loaded.add(c); bump();
      }, err => this.fail(err));
    }
    this.db.doc('config/general').onSnapshot(s => {
      S.config = { ...DEFAULT_CONFIG, ...(s.exists ? s.data() : {}) };
      S.loaded.add('config'); bump();
    }, err => this.fail(err));
  },
  fail(err) {
    if (err && err.code === 'revoked') { S.readOnly = true; toast('Se perdió el acceso a la base de datos. Recarga la página.'); }
    else toast('No se pudieron leer los datos. Recarga la página.');
  },
  loadLocal() {
    try {
      const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null');
      if (raw) { for (const c of COLS) S.data[c] = Array.isArray(raw[c]) ? raw[c] : []; S.config = { ...DEFAULT_CONFIG, ...(raw.config || {}) }; }
    } catch { /* vacío */ }
    COLS.forEach(c => S.loaded.add(c)); S.loaded.add('config');
  },
  saveLocal() {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...S.data, config: S.config })); }
    catch { toast('Este navegador no permitió guardar. Exporta tus datos para no perderlos.'); }
  },
  async retry(fn) {
    try { return await fn(); }
    catch (e) {
      if (e && e.code === 'unavailable') { await new Promise(r => setTimeout(r, 400 + Math.random() * 600)); return fn(); }
      throw e;
    }
  },
  async save(col, rec) {
    const id = rec.id || uid();
    const body = clone(rec); delete body.id;
    body.actualizado = new Date().toISOString();
    if (!body.creado) body.creado = body.actualizado;
    if (this.db) { await this.retry(() => this.db.collection(col).doc(id).set(body)); }
    else {
      const arr = S.data[col]; const i = arr.findIndex(x => x.id === id);
      if (i >= 0) arr[i] = { ...body, id }; else arr.push({ ...body, id });
      this.saveLocal(); bump();
    }
    return id;
  },
  async remove(col, id) {
    if (this.db) await this.retry(() => this.db.collection(col).doc(id).delete());
    else { S.data[col] = S.data[col].filter(x => x.id !== id); this.saveLocal(); bump(); }
  },
  async saveConfig(cfg) {
    const body = { ...S.config, ...cfg };
    if (this.db) await this.retry(() => this.db.doc('config/general').set(body));
    else { S.config = body; this.saveLocal(); bump(); }
  },
};

function errMsg(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') return 'La base de datos está llena. Exporta y borra registros viejos para seguir guardando.';
  if (c === 'invalid_argument') return 'No se pudo guardar: revisa los datos del formulario.';
  if (c === 'resource_exhausted') return 'Demasiados cambios seguidos. Espera unos segundos e intenta de nuevo.';
  if (c === 'revoked' || c === 'not_granted') return 'No tienes permiso para guardar en este tablero.';
  return 'No se pudo guardar. Revisa tu conexión e intenta de nuevo.';
}

/* =========================================================================
   Cálculos del negocio
   ========================================================================= */
// Medidas en pulgadas (ancho × grueso) y largo en metros. 1 rastra = ancho × grueso × largo / 240.
function parseMedida(txt) {
  const m = String(txt || '').toLowerCase().replace(/\s/g, '').replace(/,/g, '.').match(/^(\d+(?:\.\d+)?)[x×*](\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const a = +m[1], b = +m[2];
  if (!a || !b) return null;
  return { a, b, key: (a <= b ? `${a}x${b}` : `${b}x${a}`).replace(/\./g, '_'), label: `${m[1]}x${m[2]}` };
}
// Las claves de largo se guardan en centímetros ("350" = 3,5 m) para no usar puntos en los nombres de campo.
const largoKey = L => String(Math.round(n(L) * 100));
const rastrasPieza = (a, b, L) => a * b * L / 240;
function pineraRate(L, cfg = CFG()) {
  const t = (Array.isArray(cfg.pinera) && cfg.pinera.length ? cfg.pinera : PINERA_2026).slice().sort((x, y) => n(x.hasta) - n(y.hasta));
  for (const r of t) if (L <= n(r.hasta) + 0.049) return n(r.valor);
  return n(t[t.length - 1] && t[t.length - 1].valor);
}
const manoObra = (cfg = CFG()) => n(cfg.aserrada) + n(cfg.arriada);
const costoRastra = (L, cfg = CFG()) => pineraRate(L, cfg) + manoObra(cfg);
function piezaInfo(medida, largo, cfg = CFG()) {
  const m = parseMedida(medida), L = n(largo);
  if (!m || !L) return null;
  const r = rastrasPieza(m.a, m.b, L);
  return { ...m, L, rastras: r, costo: r * costoRastra(L, cfg) };
}
// Precio de una pieza en una lista. Si el largo exacto no está, usa la tarifa por rastra del largo menor más cercano.
function listaPrecio(lista, medida, largo) {
  if (!lista || !lista.precios) return 0;
  const m = parseMedida(medida), L = n(largo);
  if (!m || !L) return 0;
  const row = lista.precios[m.key];
  if (!row) return 0;
  if (n(row[largoKey(L)])) return Math.round(n(row[largoKey(L)]));
  const ks = Object.keys(row).map(k => +k / 100).filter(k => k <= L + 1e-9 && n(row[largoKey(k)])).sort((x, y) => y - x);
  if (!ks.length) return 0;
  const k = ks[0];
  return Math.round(n(row[largoKey(k)]) / rastrasPieza(m.a, m.b, k) * rastrasPieza(m.a, m.b, L));
}
const itemName = l => l.unidad === 'rastra' ? 'Rastras sin detalle' : `${l.medida || '?'} × ${num(l.largo, 2)} m`;
const itemKey = l => {
  if (l.unidad === 'rastra') return 'rastra';
  const m = parseMedida(l.medida);
  return `${m ? m.key : String(l.medida || '?')}|${largoKey(l.largo)}`;
};
const medidaOf = l => l.unidad === 'rastra' ? 'Sin detalle' : (parseMedida(l.medida)?.label || String(l.medida || '?'));

// Venta a mayorista o cliente final: precio por unidad, costo y rastras congelados en la línea.
function calcVenta(v) {
  const lines = (v.items || []).map(l => {
    const cant = n(l.cant), precio = n(l.precio), costo = n(l.costo), r = n(l.rastras);
    return { ...l, cant, ingreso: cant * precio, costoT: cant * costo, util: cant * (precio - costo), rastrasT: cant * r };
  });
  const sub = sum(lines, l => l.ingreso);
  const flete = n(v.flete), costoFlete = n(v.costoFlete);
  const total = sub + flete;
  const costo = sum(lines, l => l.costoT) + costoFlete;
  const pagado = sum(v.pagos || [], p => p.valor);
  return {
    lines, sub, flete, costoFlete, total, costo, util: total - costo,
    rastras: sum(lines, l => l.rastrasT), piezas: sum(lines.filter(l => l.unidad !== 'rastra'), l => l.cant),
    pagado, saldo: total - pagado,
  };
}

// Venta reportada por Barro Blanco.
// Utilidad del punto = venta − precio fijado. Tu parte = pct de esa utilidad.
// Rubén te liquida: precio fijado + tu parte. Tu utilidad real = lo que te liquida − tu costo.
function calcBB(v, cfgPct) {
  const p = n(v.pct ?? cfgPct) / 100;
  const lines = (v.items || []).map(l => {
    const cant = n(l.cant), pv = n(l.precio), pbb = n(l.pbb), costo = n(l.costo), r = n(l.rastras);
    const venta = cant * pv, base = cant * pbb, up = venta - base, mi = up * p, debe = base + mi, costoT = cant * costo;
    return { ...l, cant, venta, base, utilPunto: up, miParte: mi, parteSocio: up - mi, ingreso: debe, costoT, util: debe - costoT, rastrasT: cant * r };
  });
  const k = f => sum(lines, f);
  return {
    lines, p, venta: k(l => l.venta), base: k(l => l.base), utilPunto: k(l => l.utilPunto), miParte: k(l => l.miParte),
    parteSocio: k(l => l.parteSocio), debe: k(l => l.ingreso), costo: k(l => l.costoT), miUtil: k(l => l.util),
    rastras: k(l => l.rastrasT), piezas: sum(lines.filter(l => l.unidad !== 'rastra'), l => l.cant),
  };
}

let MODEL = null, MODEL_KEY = '';
function model() {
  const key = `${S.ver}|${S.demo}`;
  if (MODEL && MODEL_KEY === key) return MODEL;
  const d = D(), cfg = CFG(), hoy = todayStr();
  const listas = new Map(d.listas.map(x => [x.id, x]));
  const listaBB = listas.get(cfg.listaBB) || d.listas.find(x => /barro|sociedad/i.test(x.nombre || ''));
  const cli = new Map(d.clientes.map(c => [c.id, c]));

  // Todas las ventas, en una sola lista con el ingreso que le queda a Agrohermanos.
  const entries = [];
  for (const v of d.ventas) {
    const c = calcVenta(v);
    const cliente = v.canal === 'mayorista' ? (cli.get(v.clienteId)?.nombre || 'Mayorista sin nombre') : (v.cliente?.nombre || 'Cliente final');
    entries.push({ src: 'ventas', id: v.id, fecha: v.fecha, canal: v.canal === 'mayorista' ? 'mayorista' : 'final', cliente, ingreso: c.total, costo: c.costo, util: c.util, rastras: c.rastras, piezas: c.piezas, lines: c.lines, ref: v, calc: c });
  }
  for (const v of d.bbVentas) {
    const c = calcBB(v, cfg.pctSocio);
    entries.push({ src: 'bbVentas', id: v.id, fecha: v.fecha, canal: 'bb', cliente: cfg.punto, ingreso: c.debe, costo: c.costo, util: c.miUtil, rastras: c.rastras, piezas: c.piezas, lines: c.lines, ref: v, calc: c });
  }
  entries.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

  // Cartera de mayoristas: los abonos pagan primero los pedidos más viejos.
  const cartera = new Map();
  for (const c of d.clientes) {
    const dias = n(c.diasCredito ?? cfg.diasCredito) || n(cfg.diasCredito);
    const pedidos = d.ventas.filter(v => v.canal === 'mayorista' && v.clienteId === c.id)
      .map(v => ({ v, total: calcVenta(v).total, vence: addDays(v.fecha, dias) }))
      .sort((a, b) => (a.v.fecha || '').localeCompare(b.v.fecha || ''));
    const abonos = d.abonos.filter(a => a.clienteId === c.id);
    let pool = sum(abonos, a => a.valor);
    for (const p of pedidos) { const pay = Math.min(pool, p.total); p.pagado = pay; p.pend = p.total - pay; pool -= pay; }
    const pend = pedidos.filter(p => p.pend > 0.5);
    const venc = pend.filter(p => p.vence < hoy);
    cartera.set(c.id, {
      cliente: c, pedidos, abonos, dias,
      saldo: sum(pedidos, p => p.total) - sum(abonos, a => a.valor),
      vencido: sum(venc, p => p.pend),
      mora: venc.length ? Math.max(...venc.map(p => diffDays(p.vence, hoy))) : 0,
      prox: pend.filter(p => p.vence >= hoy).map(p => p.vence).sort()[0] || '',
      ultima: pedidos.length ? pedidos[pedidos.length - 1].v.fecha : '',
    });
  }
  const estadoPedido = new Map();
  for (const c of cartera.values()) for (const p of c.pedidos) estadoPedido.set(p.v.id, p);

  // Barro Blanco: inventario en el punto y cuenta con Rubén.
  const inv = new Map();
  const touch = l => {
    const k = itemKey(l);
    if (!inv.has(k)) inv.set(k, { key: k, nombre: itemName(l), medida: l.medida, largo: n(l.largo), unidad: l.unidad || 'pieza', desp: 0, dev: 0, vend: 0, pbb: 0, costo: n(l.costo), rastras: n(l.rastras), fechaPbb: '' });
    return inv.get(k);
  };
  for (const mv of d.bbDespachos) for (const l of mv.items || []) {
    const r = touch(l);
    if (mv.tipo === 'devolucion') r.dev += n(l.cant);
    else { r.desp += n(l.cant); if ((mv.fecha || '') >= r.fechaPbb) { r.pbb = n(l.precio); r.fechaPbb = mv.fecha || ''; r.costo = n(l.costo); r.rastras = n(l.rastras); } }
  }
  for (const v of d.bbVentas) for (const l of v.items || []) touch(l).vend += n(l.cant);
  for (const r of inv.values()) { r.stock = r.desp - r.dev - r.vend; if (!r.pbb) r.pbb = listaPrecio(listaBB, r.medida, r.largo); }
  const bbEntries = entries.filter(e => e.canal === 'bb');
  const bbSaldo = sum(bbEntries, e => e.ingreso) - sum(d.bbPagos, p => p.valor);

  // La Pinera: estado de cuenta corrido.
  const ledger = [
    ...d.pineraCompras.map(x => ({ tipo: 'cargo', fecha: x.fecha, valor: n(x.valor), rastras: n(x.rastras), ref: x, col: 'pineraCompras' })),
    ...d.pineraPagos.map(x => ({ tipo: 'pago', fecha: x.fecha, valor: n(x.valor), ref: x, col: 'pineraPagos' })),
  ].sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '') || (a.tipo === 'cargo' ? -1 : 1));
  let run = 0;
  for (const m of ledger) { run += m.tipo === 'cargo' ? m.valor : -m.valor; m.saldo = run; }

  const finalSaldo = sum(entries.filter(e => e.canal === 'final'), e => Math.max(0, e.calc.saldo));
  const mayorSaldo = sum([...cartera.values()], c => Math.max(0, c.saldo));

  const allDates = [
    ...d.ventas, ...d.abonos, ...d.bbDespachos, ...d.bbVentas, ...d.bbPagos, ...d.pineraCompras, ...d.pineraPagos, ...d.gastos,
  ].map(x => x.fecha).filter(isDate).sort();

  MODEL = { d, cfg, hoy, listas, listaBB, cli, entries, cartera, estadoPedido, inv, bbEntries, bbSaldo, ledger, pineraSaldo: run, finalSaldo, mayorSaldo, firstDate: allDates[0] || '', lastDate: allDates[allDates.length - 1] || '' };
  MODEL_KEY = key;
  return MODEL;
}

/* =========================================================================
   Rango de fechas
   ========================================================================= */
function rangeBounds() {
  const hoy = todayStr();
  const y = +hoy.slice(0, 4), m = +hoy.slice(5, 7);
  switch (S.range) {
    case 'hoy': return { from: hoy, to: hoy };
    case '7d': return { from: addDays(hoy, -6), to: hoy };
    case '15d': return { from: addDays(hoy, -14), to: hoy };
    case '30d': return { from: addDays(hoy, -29), to: hoy };
    case 'mes': return { from: `${y}-${pad(m)}-01`, to: hoy };
    case 'mesant': {
      const py = m === 1 ? y - 1 : y, pm = m === 1 ? 12 : m - 1;
      return { from: `${py}-${pad(pm)}-01`, to: addDays(`${y}-${pad(m)}-01`, -1) };
    }
    case 'ano': return { from: `${y}-01-01`, to: hoy };
    case 'todo': {
      const M = model();
      const to = M.lastDate && M.lastDate > hoy ? M.lastDate : hoy;
      return { from: M.firstDate && M.firstDate < to ? M.firstDate : addDays(hoy, -29), to };
    }
    case 'custom': {
      const f = isDate(S.customFrom) ? S.customFrom : addDays(hoy, -29);
      const t = isDate(S.customTo) ? S.customTo : hoy;
      return f <= t ? { from: f, to: t } : { from: t, to: f };
    }
    default: return { from: addDays(hoy, -29), to: hoy };
  }
}
const inR = (f, R) => isDate(f) && f >= R.from && f <= R.to;
const rangeLabel = R => {
  const days = diffDays(R.from, R.to) + 1;
  return R.from === R.to ? fmtDate(R.from) : `${fmtDate(R.from)} → ${fmtDate(R.to)} · ${days} días`;
};

function bucketize(R) {
  const days = diffDays(R.from, R.to) + 1;
  const unit = days <= 35 ? 'day' : days <= 210 ? 'week' : 'month';
  const keys = [];
  if (unit === 'day') for (let s = R.from; s <= R.to; s = addDays(s, 1)) keys.push(s);
  else if (unit === 'week') for (let s = mondayOf(R.from); s <= R.to; s = addDays(s, 7)) keys.push(s);
  else {
    let s = R.from.slice(0, 7) + '-01';
    while (s <= R.to) { keys.push(s); const d = toD(s); d.setUTCMonth(d.getUTCMonth() + 1); s = fromD(d); }
  }
  const keyOf = f => unit === 'day' ? f : unit === 'week' ? mondayOf(f) : f.slice(0, 7) + '-01';
  const label = k => unit === 'month' ? `${MESES[+k.slice(5, 7) - 1]} ${k.slice(2, 4)}` : fmtDay(k);
  const tipLabel = k => unit === 'day' ? fmtDate(k) : unit === 'week' ? `Semana del ${fmtDay(k)}` : `${MESES[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}`;
  const index = new Map(keys.map((k, i) => [k, i]));
  return { unit, keys, keyOf, label, tipLabel, index };
}

/* =========================================================================
   Gráficas (SVG propio, colores desde los tokens del tema)
   ========================================================================= */
let CH = {}, chSeq = 0;
function chartSlot(spec, h = 230) { const id = 'c' + (++chSeq); CH[id] = spec; return `<div class="chart" data-chart="${id}" style="height:${h}px"></div>`; }
function drawCharts() {
  for (const el of $$('[data-chart]')) {
    const sp = CH[el.dataset.chart];
    if (sp) { try { DRAW[sp.type](el, sp); } catch (e) { el.innerHTML = '<div class="chart-note">No se pudo dibujar la gráfica.</div>'; } }
  }
}
function niceTicks(lo, hi, count = 4) {
  if (lo === hi) { hi = lo + (lo === 0 ? 1 : Math.abs(lo) * .5); }
  const raw = (hi - lo) / count, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step;
  const ticks = []; for (let v = a; v <= b + step * 1e-6; v += step) ticks.push(+v.toFixed(6));
  return { lo: a, hi: b, ticks };
}
function tipRows(tip, title, rows) {
  tip.textContent = '';
  const t = document.createElement('div'); t.className = 'tt'; t.textContent = title; tip.appendChild(t);
  for (const r of rows) {
    const row = document.createElement('div'); row.className = 'tr';
    const i = document.createElement('i'); i.style.background = r.color; if (r.box) { i.style.height = '9px'; i.style.width = '9px'; }
    const b = document.createElement('b'); b.textContent = r.value;
    const s = document.createElement('span'); s.textContent = r.label;
    row.append(i, b, s); tip.appendChild(row);
  }
}
function placeTip(el, tip, x, y) {
  tip.hidden = false;
  const W = el.clientWidth, tw = tip.offsetWidth, th = tip.offsetHeight;
  let left = x + 14; if (left + tw > W) left = x - tw - 14; if (left < 0) left = Math.max(0, Math.min(W - tw, x - tw / 2));
  tip.style.left = left + 'px'; tip.style.top = Math.max(0, Math.min(el.clientHeight - th, y - th / 2)) + 'px';
}

const DRAW = {
  line(el, sp) {
    const W = Math.max(260, el.clientWidth), H = el.clientHeight || 230, N = sp.labels.length;
    if (N < 2) { el.innerHTML = `<div class="chart-note">${esc(sp.empty || 'Elige un rango de varios días para ver la tendencia.')}</div>`; return; }
    const vals = sp.series.flatMap(s => s.values);
    const yt = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals), 4);
    const labW = Math.max(...yt.ticks.map(t => sp.fmtY(t).length)) * 6.6 + 10;
    const m = { t: 10, r: 14, b: 24, l: Math.max(40, labW) };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const x = i => m.l + i * iw / (N - 1);
    const y = v => m.t + ih - (v - yt.lo) / (yt.hi - yt.lo) * ih;
    let g = '';
    for (const t of yt.ticks) {
      g += `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}" class="${t === 0 ? 'axis-l' : 'grid-l'}"/>`;
      g += `<text x="${m.l - 8}" y="${y(t).toFixed(1)}" class="tk" text-anchor="end" dominant-baseline="middle">${esc(sp.fmtY(t))}</text>`;
    }
    const every = Math.max(1, Math.ceil(N / Math.max(2, Math.floor(iw / 64))));
    for (let i = 0; i < N; i += every) g += `<text x="${x(i).toFixed(1)}" y="${H - 6}" class="tk" text-anchor="${i === 0 ? 'start' : 'middle'}">${esc(sp.fmtX(sp.labels[i]))}</text>`;
    const base = y(Math.max(yt.lo, 0));
    for (const s of sp.series) {
      const pts = s.values.map((v, i) => [x(i), y(v)]);
      const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
      if (s.area) g += `<path d="${d}L${x(N - 1).toFixed(1)} ${base.toFixed(1)}L${x(0).toFixed(1)} ${base.toFixed(1)}Z" style="fill:${s.color};fill-opacity:.10;stroke:none"/>`;
      g += `<path d="${d}" style="fill:none;stroke:${s.color};stroke-width:2;stroke-linejoin:round;stroke-linecap:round"/>`;
      const L = pts[N - 1]; g += `<circle cx="${L[0].toFixed(1)}" cy="${L[1].toFixed(1)}" r="4" style="fill:${s.color};stroke:var(--surface);stroke-width:2"/>`;
    }
    el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(sp.aria || '')}">${g}<line class="xh" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" visibility="hidden"/><g class="hov"></g><rect x="${m.l}" y="0" width="${iw}" height="${H}" style="fill:transparent"/></svg><div class="tip" hidden></div>`;
    const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), xh = svg.querySelector('.xh'), hov = svg.querySelector('.hov');
    const show = cx => {
      const i = Math.max(0, Math.min(N - 1, Math.round((cx - m.l) / (iw / (N - 1)))));
      const X = x(i).toFixed(1);
      xh.setAttribute('x1', X); xh.setAttribute('x2', X); xh.setAttribute('visibility', 'visible');
      hov.innerHTML = sp.series.map(s => `<circle cx="${X}" cy="${y(s.values[i]).toFixed(1)}" r="4" style="fill:${s.color};stroke:var(--surface);stroke-width:2"/>`).join('');
      tipRows(tip, sp.tipX(sp.labels[i]), sp.series.map(s => ({ color: s.color, value: sp.fmtTip(s.values[i]), label: s.label })));
      placeTip(el, tip, +X, m.t + ih / 2);
    };
    const hide = () => { xh.setAttribute('visibility', 'hidden'); hov.innerHTML = ''; tip.hidden = true; };
    svg.addEventListener('pointermove', e => show(e.clientX - svg.getBoundingClientRect().left));
    svg.addEventListener('pointerleave', hide);
  },
  donut(el, sp) {
    const S0 = Math.min(el.clientWidth || 168, 168), r = S0 / 2 - 9, sw = 16, C = 2 * Math.PI * r;
    const total = sum(sp.items, i => Math.max(0, i.value));
    let g = `<circle cx="${S0 / 2}" cy="${S0 / 2}" r="${r}" style="fill:none;stroke:var(--sunken);stroke-width:${sw}"/>`;
    let acc = 0;
    const segs = [];
    if (total > 0) for (const it of sp.items) {
      const v = Math.max(0, it.value); if (!v) continue;
      const len = v / total * C, gap = sp.items.filter(i => i.value > 0).length > 1 ? 2 : 0;
      g += `<circle data-i="${segs.length}" cx="${S0 / 2}" cy="${S0 / 2}" r="${r}" style="fill:none;stroke:${it.color};stroke-width:${sw};cursor:default" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${(C - len + gap).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 ${S0 / 2} ${S0 / 2})"/>`;
      segs.push(it); acc += len;
    }
    g += `<text x="${S0 / 2}" y="${S0 / 2 - 4}" text-anchor="middle" style="fill:var(--fg);font:600 17px var(--f-ui)">${esc(sp.center)}</text>`;
    g += `<text x="${S0 / 2}" y="${S0 / 2 + 15}" text-anchor="middle" class="tk">${esc(sp.centerLabel || '')}</text>`;
    el.style.height = S0 + 'px';
    el.innerHTML = `<svg width="${S0}" height="${S0}" viewBox="0 0 ${S0} ${S0}" role="img" aria-label="${esc(sp.aria || '')}">${g}</svg><div class="tip" hidden></div>`;
    const tip = el.querySelector('.tip');
    $$('circle[data-i]', el).forEach(c => {
      c.addEventListener('pointermove', e => {
        const it = segs[+c.dataset.i], rc = el.getBoundingClientRect();
        tipRows(tip, it.label, [{ color: it.color, box: true, value: sp.fmt(it.value), label: pct(it.value / total) }]);
        placeTip(el, tip, e.clientX - rc.left, e.clientY - rc.top);
      });
      c.addEventListener('pointerleave', () => { tip.hidden = true; });
    });
  },
};

function hbars(items, { fmt, color = 'var(--s1)', max } = {}) {
  if (!items.length) return '';
  const mx = max ?? Math.max(...items.map(i => Math.abs(i.value)), 1);
  return `<div class="hb">${items.map(i => `
    <div class="hb-r"><span class="hb-l" title="${esc(i.label)}">${esc(i.label)}</span>
      <div class="hb-t"><i style="width:${Math.max(0, i.value) / mx * 100}%;background:${i.color || color}"></i></div>
      <span class="hb-v ${i.value < 0 ? 'neg' : ''}">${esc(fmt(i.value))}</span></div>`).join('')}</div>`;
}

/* =========================================================================
   Piezas de interfaz
   ========================================================================= */
const kpi = (label, value, sub = '', o = {}) => `<div class="kpi"><div class="kpi-l">${o.dot ? `<i style="background:${o.dot}"></i>` : ''}${label}</div><div class="kpi-v ${o.cls || ''}">${value}</div>${sub ? `<div class="kpi-s">${sub}</div>` : ''}</div>`;
const card = (title, body, o = {}) => `<section class="card ${o.cls || ''}">${title ? `<header class="card-h"><div><h3>${title}</h3>${o.sub ? `<p>${o.sub}</p>` : ''}</div>${o.acts ? `<div class="acts">${o.acts}</div>` : ''}</header>` : ''}${body}</section>`;
const chip = (tone, text, ic) => `<span class="chip ${tone}">${ic ? icon(ic) : ''}${esc(text)}</span>`;
const btn = (label, attrs, cls = '') => `<button type="button" class="btn ${cls}" ${attrs}>${label}</button>`;
const addBtn = (label, form, cls = 'sm') => btn(`${icon('plus')}${esc(label)}`, `data-act="form" data-form="${form}"`, cls);
const signed = v => `<span class="${v < 0 ? 'neg' : ''}">${cop(v)}</span>`;

function delta(cur, prev) {
  if (!prev || !Number.isFinite(cur / prev)) return '';
  const d = (cur - prev) / Math.abs(prev);
  if (!Number.isFinite(d)) return '';
  const tone = d >= 0 ? 'good' : 'crit';
  return chip(tone, `${d >= 0 ? '+' : '−'}${pct(Math.abs(d))} vs. período anterior`, d >= 0 ? 'up' : 'down');
}

function table(cols, rows, o = {}) {
  if (!rows.length) return `<div class="empty">${o.empty || '<p>No hay registros en este período.</p>'}</div>`;
  const LIMIT = o.limit || 250;
  const shown = rows.slice(0, LIMIT);
  const th = cols.map(c => `<th class="${c.r ? 'r' : ''}">${c.h}</th>`).join('');
  const tr = shown.map(r => {
    const act = o.act ? o.act(r) : '';
    return `<tr ${act}${act ? ' tabindex="0"' : ''}>${cols.map(c => `<td class="${c.r ? 'r' : ''} ${c.cls || ''}">${c.f(r)}</td>`).join('')}</tr>`;
  }).join('');
  const tf = o.foot ? `<tfoot><tr>${o.foot.map((f, i) => `<td class="${cols[i] && cols[i].r ? 'r' : ''}">${f}</td>`).join('')}</tr></tfoot>` : '';
  const more = rows.length > LIMIT ? `<p class="muted" style="margin-top:10px;font-size:12px">Mostrando ${LIMIT} de ${rows.length}. Acorta el rango de fechas para ver el resto.</p>` : '';
  return `<div class="tbl-wrap"><table class="tbl"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody>${tf}</table></div>${more}`;
}
const editAttr = (col, id) => `data-act="edit" data-col="${col}" data-id="${esc(id)}"`;

function detalle(lines) {
  const pzs = sum(lines.filter(l => l.unidad !== 'rastra'), l => l.cant);
  const names = lines.map(l => l.unidad === 'rastra' ? `${num(l.cant)} rastras` : `${n(l.cant)}× ${l.medida}×${num(l.largo)}`);
  const head = names.slice(0, 2).join(', ') + (names.length > 2 ? ` +${names.length - 2}` : '');
  return `${pzs ? `${num(pzs, 0)} pzs` : ''}<span class="sub">${esc(head)}</span>`;
}

function emptyState(title, text, actions = '') {
  return `<div class="empty"><b>${esc(title)}</b><p>${text}</p>${actions ? `<div class="pills">${actions}</div>` : ''}</div>`;
}

/* =========================================================================
   Marco: navegación, filtro de fechas, avisos
   ========================================================================= */
let raf = 0;
function bump() { S.ver++; schedule(); }
function schedule() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; render(); }); }

function renderNav() {
  const M = model();
  const vencidos = [...M.cartera.values()].filter(c => c.vencido > 0.5).length;
  let g = '', html = '';
  for (const v of VIEWS) {
    if (v.group !== g) { g = v.group; html += `<div class="nav-g">${g}</div>`; }
    const badge = v.id === 'mayoristas' && vencidos ? `<span class="badge" title="Clientes con saldo vencido">${vencidos}</span>` : '';
    html += `<button type="button" data-act="nav" data-v="${v.id}" ${S.view === v.id ? 'aria-current="page"' : ''}>${icon(v.icon)}<span>${v.label}</span>${badge}</button>`;
  }
  $('#nav').innerHTML = html;
  const st = S.mode === 'db' ? ['on', 'Sincronizado'] : S.mode === 'local' ? ['local', 'Solo este navegador'] : ['', 'Conectando…'];
  $('#rail-foot').innerHTML = `<div class="sync ${st[0]}"><i></i>${st[1]}</div>
    <button type="button" class="btn ghost sm" data-act="demo" style="justify-content:flex-start;padding-left:0">${S.demo ? 'Salir del ejemplo' : 'Ver con datos de ejemplo'}</button>`;
}

function renderFilters() {
  const R = rangeBounds();
  const seg = RANGES.map(([k, l]) => `<button type="button" data-act="range" data-r="${k}" aria-pressed="${S.range === k}">${l}</button>`).join('');
  const custom = S.range === 'custom' ? `<div class="custom"><label for="cf">Desde</label><input id="cf" type="date" value="${esc(R.from)}" data-range="from"><label for="ct">hasta</label><input id="ct" type="date" value="${esc(R.to)}" data-range="to"></div>` : '';
  $('#filters').innerHTML = `<div class="seg" role="group" aria-label="Rango de fechas">${seg}</div>${custom}<span class="range-txt">${esc(rangeLabel(R))}</span>`;
}

function renderBanner() {
  let h = '';
  if (S.demo) h = `<div class="banner"><span><b>Estás viendo datos de ejemplo.</b> Son inventados para mostrar cómo se ve el tablero. No se guardan ni se mezclan con tus datos.</span>${btn('Salir del ejemplo', 'data-act="demo"', 'sm')}</div>`;
  else if (S.mode === 'local') h = `<div class="banner"><span><b>Modo local.</b> Abriste el archivo fuera de Claude: lo que registres se guarda solo en este navegador. Exporta una copia desde Datos para no perderla.</span></div>`;
  else if (S.mode === 'db' && S.loaded.size < COLS.length + 1) h = `<div class="banner"><span>Cargando tus datos…</span></div>`;
  $('#banner').innerHTML = h;
}

const MENU = [
  ['Ventas', [['venta-mayorista', 'Pedido de mayorista'], ['abono', 'Abono de mayorista'], ['venta-final', 'Pedido de cliente final']]],
  ['Barro Blanco', [['bb-despacho', 'Despacho al punto'], ['bb-venta', 'Venta reportada por Rubén'], ['bb-pago', 'Pago de Rubén'], ['bb-devolucion', 'Devolución del punto']]],
  ['Compras y costos', [['pinera-compra', 'Compra o cargo de la pinera'], ['pinera-pago', 'Pago a la pinera'], ['gasto', 'Gasto']]],
  ['Configuración', [['cliente', 'Cliente mayorista'], ['lista', 'Lista de precios']]],
];
function renderMenu() {
  $('#menu').innerHTML = MENU.map(([g, items]) => `<h4>${g}</h4>${items.map(([f, l]) => `<button type="button" data-act="form" data-form="${f}"><i></i>${l}</button>`).join('')}`).join('');
}

function render() {
  CH = {}; chSeq = 0;
  renderNav(); renderFilters(); renderBanner();
  const v = VIEWS.find(x => x.id === S.view) || VIEWS[0];
  $('#filters').hidden = v.id === 'precios' || v.id === 'datos';
  $('#view-title').textContent = v.label;
  $('#view-eyebrow').textContent = S.demo ? 'Agrohermanos · ejemplo' : 'Agrohermanos';
  const R = rangeBounds();
  let html;
  try { html = VIEW_FN[v.id](R); }
  catch (e) { console.error(e); html = card('', emptyState('Algo falló al mostrar esta sección.', esc(e && e.message || ''))); }
  $('#view').innerHTML = html;
  drawCharts();
}

/* =========================================================================
   Vistas
   ========================================================================= */
const VIEW_FN = {};

function prevRange(R) {
  const days = diffDays(R.from, R.to) + 1;
  return { from: addDays(R.from, -days), to: addDays(R.from, -1) };
}
function periodo(M, R) {
  const E = M.entries.filter(e => inR(e.fecha, R));
  const G = M.d.gastos.filter(g => inR(g.fecha, R));
  const ingreso = sum(E, e => e.ingreso), utilB = sum(E, e => e.util), gastos = sum(G, g => g.valor);
  return { E, G, ingreso, utilB, gastos, utilN: utilB - gastos, rastras: sum(E, e => e.rastras), piezas: sum(E, e => e.piezas) };
}
function trend(R, entries, gastos, pick) {
  const B = bucketize(R);
  const a = B.keys.map(() => 0), b = B.keys.map(() => 0);
  for (const e of entries) { const i = B.index.get(B.keyOf(e.fecha)); if (i != null) { a[i] += pick ? pick(e) : e.ingreso; b[i] += e.util; } }
  for (const g of gastos || []) { const i = B.index.get(B.keyOf(g.fecha)); if (i != null) b[i] -= n(g.valor); }
  return { B, a, b };
}
function trendChart(R, entries, gastos, o = {}) {
  const T = trend(R, entries, gastos);
  return chartSlot({
    type: 'line', labels: T.B.keys, fmtX: T.B.label, tipX: T.B.tipLabel, fmtY: v => cop(v, true), fmtTip: v => cop(v),
    aria: o.aria || 'Ventas y utilidad en el tiempo',
    series: [
      { label: o.aLabel || 'Ventas', color: 'var(--s3)', values: T.a },
      { label: o.bLabel || 'Utilidad', color: 'var(--s1)', values: T.b, area: true },
    ],
  }, o.h || 240);
}
const trendLegend = (a = 'Ventas', b = 'Utilidad') => `<div class="legend"><span><i style="background:var(--s3)"></i>${a}</span><span><i style="background:var(--s1)"></i>${b}</span></div>`;

function alertas(M) {
  const out = [];
  for (const c of M.cartera.values()) {
    if (c.vencido > 0.5) out.push(['crit', `${c.cliente.nombre} tiene ${cop(c.vencido)} vencido`, `Lleva ${c.mora} días de mora. Saldo total ${cop(c.saldo)}.`, 'mayoristas']);
    else if (c.prox && diffDays(M.hoy, c.prox) <= 5 && c.saldo > 0.5) out.push(['warn', `${c.cliente.nombre} tiene un pago por vencer`, `Vence el ${fmtDate(c.prox)}. Saldo ${cop(c.saldo)}.`, 'mayoristas']);
  }
  const bajos = [...M.inv.values()].filter(r => r.desp > 0 && r.stock <= n(M.cfg.stockMin));
  if (bajos.length) out.push(['warn', `${bajos.length} ${bajos.length === 1 ? 'referencia está' : 'referencias están'} por acabarse en ${M.cfg.punto}`, bajos.slice(0, 4).map(r => `${r.nombre}: ${num(r.stock, 0)}`).join(' · '), 'bb']);
  if (M.bbSaldo > 0.5) {
    const ult = M.d.bbPagos.map(p => p.fecha).filter(isDate).sort().pop();
    out.push([ult && diffDays(ult, M.hoy) > 15 ? 'warn' : 'info', `${M.cfg.socio} te debe ${cop(M.bbSaldo)}`, ult ? `Último pago el ${fmtDate(ult)}.` : 'Todavía no hay pagos registrados.', 'bb']);
  }
  if (M.pineraSaldo > 0.5) out.push(['info', `Le debes ${cop(M.pineraSaldo)} a la pinera`, 'Saldo del estado de cuenta con La Pinera.', 'pinera']);
  if (M.finalSaldo > 0.5) out.push(['warn', `Clientes finales te deben ${cop(M.finalSaldo)}`, 'Pedidos con pago pendiente.', 'final']);
  return out;
}
function alertList(list) {
  if (!list.length) return `<div class="empty"><b>Todo en orden.</b><p>No hay pagos vencidos, ni inventario bajo, ni deudas pendientes.</p></div>`;
  const ic = { crit: 'alert', warn: 'clock', info: 'info' };
  return `<div class="alerts">${list.map(([t, h, s, v]) => `<div class="alert ${t}"><span class="ico">${icon(ic[t])}</span><div>${esc(h)}<small>${esc(s)}</small></div><button type="button" class="btn ghost sm" data-act="nav" data-v="${v}">Ver</button></div>`).join('')}</div>`;
}

function onboarding() {
  return card('Empecemos', `<div class="stack" style="gap:12px">
    <p style="max-width:70ch;color:var(--fg-2)">Todavía no hay movimientos. Puedes registrarlos aquí con el botón <b>Registrar</b>, o mandarle a Claude las remisiones, abonos y ventas de Barro Blanco por el chat para que las cargue por ti. Para ver cómo luce el tablero lleno, mira los datos de ejemplo.</p>
    <div class="pills">${addBtn('Pedido de mayorista', 'venta-mayorista', '')}${addBtn('Despacho a Barro Blanco', 'bb-despacho', '')}${addBtn('Compra a la pinera', 'pinera-compra', '')}${btn('Ver con datos de ejemplo', 'data-act="demo"', 'ghost')}</div>
  </div>`);
}

/* ---------- Resumen ---------- */
VIEW_FN.resumen = R => {
  const M = model();
  const P = periodo(M, R);
  const Q = S.range === 'todo' ? null : periodo(M, prevRange(R));
  const invPzs = sum([...M.inv.values()], r => Math.max(0, r.stock));
  const invVal = sum([...M.inv.values()], r => Math.max(0, r.stock) * r.pbb);
  const porCobrar = M.mayorSaldo + M.finalSaldo + Math.max(0, M.bbSaldo);
  const margen = P.ingreso ? P.utilN / P.ingreso : NaN;
  const porRastra = P.rastras ? P.utilN / P.rastras : 0;

  const top = `<div class="kpis">
    ${kpi('Ventas', cop(P.ingreso), `${P.E.length} ${P.E.length === 1 ? 'venta' : 'ventas'}${Q ? ' ' + delta(P.ingreso, Q.ingreso) : ''}`)}
    ${kpi('Utilidad neta', signed(P.utilN), `Margen ${pct(margen)}${Q ? ' ' + delta(P.utilN, Q.utilN) : ''}`, { cls: '' })}
    ${kpi('Rastras vendidas', num(P.rastras, 2), `${num(P.piezas, 0)} piezas`)}
    ${kpi('Utilidad por rastra', signed(porRastra), 'Utilidad neta ÷ rastras vendidas')}
  </div>`;
  const pos = `<div class="kpis soft">
    ${kpi('Por cobrar hoy', cop(porCobrar), `Mayoristas ${cop(M.mayorSaldo, true)} · ${esc(M.cfg.socio)} ${cop(Math.max(0, M.bbSaldo), true)} · Finales ${cop(M.finalSaldo, true)}`, { cls: 'sm' })}
    ${kpi('Saldo con la pinera', M.pineraSaldo >= 0 ? cop(M.pineraSaldo) : cop(-M.pineraSaldo), M.pineraSaldo >= 0 ? 'Le debes' : 'A tu favor', { cls: 'sm' })}
    ${kpi(`Inventario en ${esc(M.cfg.punto)}`, `${num(invPzs, 0)} pzs`, `${cop(invVal)} a precio de sociedad`, { cls: 'sm' })}
    ${kpi('Gastos del período', cop(P.gastos), `${P.G.length} registros · ya restados de la utilidad`, { cls: 'sm' })}
  </div>`;

  if (!M.firstDate) return top + onboarding();

  const canales = ['mayorista', 'bb', 'final'].map(k => ({ label: CANAL[k].label, color: CANAL[k].color, value: sum(P.E.filter(e => e.canal === k), e => e.ingreso), util: sum(P.E.filter(e => e.canal === k), e => e.util), rastras: sum(P.E.filter(e => e.canal === k), e => e.rastras) }));
  const totCan = sum(canales, c => c.value);
  const donut = totCan > 0 ? `<div class="donut">${chartSlot({ type: 'donut', items: canales, center: cop(totCan, true), centerLabel: 'ventas', fmt: v => cop(v), aria: 'Ventas por canal' }, 168)}
    <div class="donut-leg">${canales.map(c => `<div><i style="background:${c.color}"></i><span>${c.label}</span><b>${pct(c.value / totCan)}</b><small>${cop(c.value, true)} · ${num(c.rastras, 1)} rastras</small></div>`).join('')}</div></div>`
    : `<div class="chart-note" style="height:168px">Sin ventas en este período.</div>`;

  const porMedida = new Map();
  for (const e of P.E) for (const l of e.lines) {
    const k = medidaOf(l);
    const r = porMedida.get(k) || { label: k, value: 0, rastras: 0 };
    r.value += l.util; r.rastras += l.rastrasT; porMedida.set(k, r);
  }
  const med = [...porMedida.values()].sort((a, b) => b.value - a.value).slice(0, 8);

  const ult = table([
    { h: 'Fecha', f: e => `<span class="num">${fmtDate(e.fecha)}</span>` },
    { h: 'Canal', f: e => `<span class="chip" style="gap:6px"><i style="width:8px;height:8px;border-radius:2px;background:${CANAL[e.canal].color}"></i>${CANAL[e.canal].label}</span>` },
    { h: 'Cliente', f: e => esc(e.cliente) },
    { h: 'Rastras', r: 1, f: e => num(e.rastras) },
    { h: 'Venta', r: 1, f: e => cop(e.ingreso) },
    { h: 'Utilidad', r: 1, f: e => signed(e.util) },
  ], P.E.slice(0, 8), { act: e => editAttr(e.src, e.id), empty: '<p>No hay ventas en este período.</p>' });

  return `${top}${pos}
    <div class="grid g-2-1">
      ${card('Ventas y utilidad', trendLegend('Ventas', 'Utilidad neta') + trendChart(R, P.E, P.G), { sub: 'Lo que te queda a ti en cada canal, después de costos y gastos.' })}
      ${card('Ventas por canal', donut, { sub: 'Barro Blanco cuenta lo que Rubén te liquida.' })}
    </div>
    <div class="grid g-1-1">
      ${card('Utilidad por medida', med.length ? hbars(med, { fmt: v => cop(v, true) }) : '<div class="chart-note" style="height:120px">Sin ventas en este período.</div>', { sub: 'Las medidas que más te dejan en el período.' })}
      ${card('Atención', alertList(alertas(M)), { sub: 'Lo que necesita tu atención hoy.' })}
    </div>
    ${card('Últimas ventas', ult, { acts: btn('Ver mayoristas', 'data-act="nav" data-v="mayoristas"', 'ghost sm') })}`;
};

/* ---------- Mayoristas ---------- */
function estadoChip(p, hoy) {
  if (!p) return '';
  if (p.pend <= 0.5) return chip('good', 'Pagado', 'check');
  if (p.vence < hoy) return chip('crit', `Vencido · ${diffDays(p.vence, hoy)} d`, 'alert');
  if (p.pagado > 0.5) return chip('warn', `Abonado ${pct(p.pagado / p.total)}`, 'clock');
  return chip('', `Vence ${fmtDay(p.vence)}`, 'clock');
}
VIEW_FN.mayoristas = R => {
  const M = model();
  const clientes = M.d.clientes.slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const head = `<div class="section-h"><p>Clientes que te compran al por mayor con crédito. Los abonos pagan primero los pedidos más viejos, así ves qué está vencido.</p>
    <div class="acts">${addBtn('Pedido', 'venta-mayorista', 'primary sm')}${addBtn('Abono', 'abono')}${addBtn('Cliente', 'cliente')}</div></div>`;
  if (!clientes.length) return head + card('', emptyState('Agrega tus clientes mayoristas', 'Crea a Madera San Fermín y Madera San Nicolás con sus días de crédito y su lista de precios. Después registras pedidos y abonos.', addBtn('Cliente mayorista', 'cliente', '')));

  const E = M.entries.filter(e => e.canal === 'mayorista' && inR(e.fecha, R));
  const sel = S.filterCli && M.cli.has(S.filterCli) ? S.filterCli : '';
  const cards = clientes.map(c => {
    const k = M.cartera.get(c.id);
    const mine = E.filter(e => e.ref.clienteId === c.id);
    const lista = M.listas.get(c.listaId);
    const st = k.vencido > 0.5 ? chip('crit', `${cop(k.vencido, true)} vencido`, 'alert') : k.saldo > 0.5 ? chip('', 'Al día', 'clock') : chip('good', 'Sin deuda', 'check');
    return `<button type="button" class="client" data-act="cli" data-id="${esc(c.id)}" aria-pressed="${sel === c.id}">
      <div class="client-h"><div><b>${esc(c.nombre)}</b><span>${esc(lista ? lista.nombre : 'Sin lista de precios')} · ${k.dias} días de crédito</span></div>${st}</div>
      <dl><div><dt>Saldo</dt><dd>${cop(k.saldo)}</dd></div><div><dt>Próximo vence</dt><dd>${k.prox ? fmtDay(k.prox) : '—'}</dd></div>
      <div><dt>Rastras período</dt><dd>${num(sum(mine, e => e.rastras))}</dd></div><div><dt>Utilidad período</dt><dd>${cop(sum(mine, e => e.util), true)}</dd></div></dl>
    </button>`;
  }).join('');

  const Ef = sel ? E.filter(e => e.ref.clienteId === sel) : E;
  const A = M.d.abonos.filter(a => inR(a.fecha, R) && (!sel || a.clienteId === sel)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const ing = sum(Ef, e => e.ingreso), ut = sum(Ef, e => e.util), ra = sum(Ef, e => e.rastras);
  const vencTot = sum([...M.cartera.values()].filter(c => !sel || c.cliente.id === sel), c => c.vencido);
  const saldoTot = sum([...M.cartera.values()].filter(c => !sel || c.cliente.id === sel), c => c.saldo);

  const kp = `<div class="kpis">
    ${kpi('Ventas', cop(ing), `${Ef.length} ${Ef.length === 1 ? 'pedido' : 'pedidos'}`, { dot: 'var(--s1)' })}
    ${kpi('Utilidad', signed(ut), `Margen ${pct(ing ? ut / ing : NaN)}`)}
    ${kpi('Rastras', num(ra), `${cop(ra ? ut / ra : 0)} de utilidad por rastra`)}
    ${kpi('Cartera hoy', cop(saldoTot), vencTot > 0.5 ? `<span class="neg">${cop(vencTot)} vencido</span>` : 'Nada vencido')}
  </div>`;
  const ped = table([
    { h: 'Fecha', f: e => `<span class="num">${fmtDate(e.fecha)}</span>` },
    { h: 'Remisión', f: e => `<span class="num">${esc(e.ref.remision || '—')}</span>` },
    { h: 'Cliente', f: e => esc(e.cliente) },
    { h: 'Detalle', f: e => detalle(e.lines) },
    { h: 'Rastras', r: 1, f: e => num(e.rastras) },
    { h: 'Total', r: 1, f: e => cop(e.ingreso) },
    { h: 'Utilidad', r: 1, f: e => signed(e.util) },
    { h: 'Estado', f: e => estadoChip(M.estadoPedido.get(e.id), M.hoy) },
  ], Ef, { act: e => editAttr('ventas', e.id), empty: '<p>No hay pedidos en este período.</p>', foot: Ef.length > 1 ? ['Total', '', '', '', num(ra), cop(ing), cop(ut), ''] : null });
  const ab = table([
    { h: 'Fecha', f: a => `<span class="num">${fmtDate(a.fecha)}</span>` },
    { h: 'Cliente', f: a => esc(M.cli.get(a.clienteId)?.nombre || '—') },
    { h: 'Medio', f: a => esc(a.medio || '—') },
    { h: 'Nota', f: a => `<span class="muted">${esc(a.nota || '')}</span>` },
    { h: 'Valor', r: 1, f: a => cop(a.valor) },
  ], A, { act: a => editAttr('abonos', a.id), empty: '<p>No hay abonos en este período.</p>', foot: A.length > 1 ? ['Total', '', '', '', cop(sum(A, a => a.valor))] : null });

  return `${head}<div class="clients">${cards}</div>${kp}
    ${card(sel ? `Pedidos de ${esc(M.cli.get(sel).nombre)}` : 'Pedidos', ped, { acts: sel ? btn('Ver todos', `data-act="cli" data-id="${esc(sel)}"`, 'ghost sm') : '' })}
    <div class="grid g-2-1">
      ${card('Ventas y utilidad', trendLegend() + trendChart(R, Ef, [], { h: 200 }))}
      ${card('Abonos', ab)}
    </div>`;
};

/* ---------- Barro Blanco ---------- */
VIEW_FN.bb = R => {
  const M = model(), cfg = M.cfg, p = n(cfg.pctSocio);
  const head = `<div class="section-h"><p>Sociedad con ${esc(cfg.socio)} en ${esc(cfg.punto)}. Le despachas a precio de sociedad; cuando vende, la utilidad sobre ese precio se reparte ${p}/${100 - p}. ${esc(cfg.socio)} te liquida el precio de sociedad más tu parte.</p>
    <div class="acts">${addBtn('Venta reportada', 'bb-venta', 'primary sm')}${addBtn('Despacho', 'bb-despacho')}${addBtn('Pago', 'bb-pago')}${addBtn('Devolución', 'bb-devolucion')}</div></div>`;
  const inv = [...M.inv.values()].filter(r => r.desp > 0 || r.vend > 0).sort((a, b) => (a.nombre).localeCompare(b.nombre, 'es', { numeric: true }));
  if (!inv.length && !M.d.bbPagos.length) return head + card('', emptyState('Todavía no hay movimientos con Barro Blanco', `Registra el primer despacho con la relación de despacho: medidas, largos y cantidades. El precio de sociedad sale de la lista “${esc(M.listaBB ? M.listaBB.nombre : 'Sociedad Barro Blanco')}”.`, addBtn('Despacho al punto', 'bb-despacho', '')));

  const E = M.bbEntries.filter(e => inR(e.fecha, R));
  const k = f => sum(E, e => f(e.calc));
  const venta = k(c => c.venta), base = k(c => c.base), up = k(c => c.utilPunto), mi = k(c => c.miParte), socio = k(c => c.parteSocio), debe = k(c => c.debe), costo = k(c => c.costo), miU = k(c => c.miUtil), ras = k(c => c.rastras);
  const pagosR = M.d.bbPagos.filter(x => inR(x.fecha, R));
  const invPzs = sum(inv, r => Math.max(0, r.stock)), invVal = sum(inv, r => Math.max(0, r.stock) * r.pbb), invCost = sum(inv, r => Math.max(0, r.stock) * r.costo);

  const kp = `<div class="kpis">
    ${kpi(`${esc(cfg.socio)} te debe hoy`, cop(Math.max(0, M.bbSaldo)), M.bbSaldo < -0.5 ? `Tiene ${cop(-M.bbSaldo)} a favor` : 'Liquidaciones menos pagos recibidos', { dot: 'var(--s2)' })}
    ${kpi('Vendido en el punto', cop(venta), `${num(ras)} rastras · ${E.length} reportes`)}
    ${kpi('Tu utilidad', signed(miU), `${cop(mi, true)} de tu ${p}% + margen sobre tu costo`)}
    ${kpi('Inventario en el punto', `${num(invPzs, 0)} pzs`, `${cop(invVal, true)} a precio sociedad · costo ${cop(invCost, true)}`)}
  </div>`;

  const invT = table([
    { h: 'Pieza', f: r => `<span class="cell-strong">${esc(r.nombre)}</span><span class="sub">${num(r.rastras, 3)} rastras/pza</span>` },
    { h: 'Despachado', r: 1, f: r => num(r.desp - r.dev, 0) },
    { h: 'Vendido', r: 1, f: r => num(r.vend, 0) },
    { h: 'En el punto', r: 1, f: r => `<b>${num(r.stock, 0)}</b>` },
    { h: '', f: r => { const tot = Math.max(1, r.desp - r.dev); const f = Math.max(0, r.stock) / tot; return `<div class="meter ${r.stock <= 0 ? 'out' : r.stock <= n(cfg.stockMin) ? 'low' : ''}"><i style="width:${(f * 100).toFixed(0)}%"></i></div>`; } },
    { h: 'Precio sociedad', r: 1, f: r => cop(r.pbb) },
    { h: 'Valor', r: 1, f: r => cop(Math.max(0, r.stock) * r.pbb) },
  ], inv, { empty: '<p>No hay piezas en el punto.</p>', foot: inv.length > 1 ? ['Total', num(sum(inv, r => r.desp - r.dev), 0), num(sum(inv, r => r.vend), 0), num(invPzs, 0), '', '', cop(invVal)] : null });

  const liq = `<div class="ledger">
    <div><span>Venta en el punto</span><b>${cop(venta)}</b></div>
    <div><span>− Precio de sociedad</span><b>${cop(base)}</b></div>
    <div><span>= Utilidad del punto</span><b>${signed(up)}</b></div>
    <div><span>Tu parte (${p}%)</span><b>${signed(mi)}</b></div>
    <div><span>Parte de ${esc(cfg.socio)} (${100 - p}%)</span><b>${signed(socio)}</b></div>
    <div class="total"><span>${esc(cfg.socio)} te liquida</span><b>${cop(debe)}</b></div>
    <div><span>Pagos recibidos en el período</span><b>${cop(sum(pagosR, x => x.valor))}</b></div>
    <div><span>Tu costo real de lo vendido</span><b>${cop(costo)}</b></div>
    <div class="total"><span>Tu utilidad real</span><b>${signed(miU)}</b></div>
  </div>`;

  const vt = table([
    { h: 'Fecha', f: e => `<span class="num">${fmtDate(e.fecha)}</span>` },
    { h: 'Detalle', f: e => detalle(e.lines) },
    { h: 'Venta punto', r: 1, f: e => cop(e.calc.venta) },
    { h: 'Utilidad punto', r: 1, f: e => signed(e.calc.utilPunto) },
    { h: 'Tu parte', r: 1, f: e => signed(e.calc.miParte) },
    { h: 'Te liquida', r: 1, f: e => cop(e.calc.debe) },
  ], E, { act: e => editAttr('bbVentas', e.id), empty: '<p>No hay ventas reportadas en este período.</p>' });
  const D0 = M.d.bbDespachos.filter(x => inR(x.fecha, R)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const dt = table([
    { h: 'Fecha', f: x => `<span class="num">${fmtDate(x.fecha)}</span>` },
    { h: 'Tipo', f: x => x.tipo === 'devolucion' ? chip('warn', 'Devolución') : chip('', 'Despacho') },
    { h: 'Remisión', f: x => `<span class="num">${esc(x.remision || '—')}</span>` },
    { h: 'Detalle', f: x => detalle(calcVenta(x).lines) },
    { h: 'Rastras', r: 1, f: x => num(calcVenta(x).rastras) },
    { h: 'Valor sociedad', r: 1, f: x => cop(calcVenta(x).sub) },
  ], D0, { act: x => editAttr('bbDespachos', x.id), empty: '<p>No hay despachos en este período.</p>' });
  const P0 = M.d.bbPagos.filter(x => inR(x.fecha, R)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  const pt = table([
    { h: 'Fecha', f: x => `<span class="num">${fmtDate(x.fecha)}</span>` },
    { h: 'Medio', f: x => esc(x.medio || '—') },
    { h: 'Nota', f: x => `<span class="muted">${esc(x.nota || '')}</span>` },
    { h: 'Valor', r: 1, f: x => cop(x.valor) },
  ], P0, { act: x => editAttr('bbPagos', x.id), empty: '<p>No hay pagos en este período.</p>' });

  return `${head}${kp}
    <div class="grid g-2-1">
      ${card('Inventario en el punto', invT, { sub: 'Despachado menos devuelto menos vendido. El precio es el del último despacho.' })}
      ${card('Liquidación del período', liq, { sub: 'Cómo se reparte lo que se vendió en el rango elegido.' })}
    </div>
    ${card('Ventas reportadas', vt, { acts: addBtn('Venta reportada', 'bb-venta') })}
    <div class="grid g-1-1">${card('Despachos y devoluciones', dt)}${card(`Pagos de ${esc(cfg.socio)}`, pt)}</div>`;
};

/* ---------- Cliente final ---------- */
const waLink = cel => { const d = String(cel || '').replace(/\D/g, ''); if (d.length < 7) return ''; const full = d.length === 10 ? '57' + d : d; return `<a href="https://wa.me/${full}" target="_blank" rel="noopener" class="chip good" style="text-decoration:none">WhatsApp</a>`; };
VIEW_FN.final = R => {
  const M = model();
  const head = `<div class="section-h"><p>Pedidos de personas que compran directo: a quién, a dónde se entrega, cuánto se cobró y cuánto falta por pagar.</p><div class="acts">${addBtn('Pedido', 'venta-final', 'primary sm')}</div></div>`;
  const all = M.entries.filter(e => e.canal === 'final');
  if (!all.length) return head + card('', emptyState('Todavía no hay pedidos de clientes finales', 'Registra el primer pedido con el nombre, celular y dirección de entrega. La utilidad se calcula con el costo real de cada pieza.', addBtn('Pedido de cliente final', 'venta-final', '')));
  const E = all.filter(e => inR(e.fecha, R));
  const ing = sum(E, e => e.ingreso), ut = sum(E, e => e.util);
  const kp = `<div class="kpis">
    ${kpi('Pedidos', num(E.length, 0), `${num(sum(E, e => e.piezas), 0)} piezas · ${num(sum(E, e => e.rastras))} rastras`, { dot: 'var(--s3)' })}
    ${kpi('Ventas', cop(ing), `Ticket promedio ${cop(E.length ? ing / E.length : 0)}`)}
    ${kpi('Utilidad', signed(ut), `Margen ${pct(ing ? ut / ing : NaN)}`)}
    ${kpi('Por cobrar hoy', cop(M.finalSaldo), `${all.filter(e => e.calc.saldo > 0.5).length} pedidos con saldo`)}
  </div>`;
  const tone = { Pendiente: 'warn', Despachado: '', Entregado: 'good' };
  const t = table([
    { h: 'Fecha', f: e => `<span class="num">${fmtDate(e.fecha)}</span>` },
    { h: 'Cliente', f: e => `<span class="cell-strong">${esc(e.cliente)}</span><span class="sub">${esc(e.ref.cliente?.celular || '')}</span>` },
    { h: 'Entrega', f: e => `${esc(e.ref.cliente?.municipio || '—')}<span class="sub">${esc(e.ref.cliente?.direccion || '')}</span>` },
    { h: 'Detalle', f: e => detalle(e.lines) },
    { h: 'Total', r: 1, f: e => cop(e.ingreso) },
    { h: 'Utilidad', r: 1, f: e => signed(e.util) },
    { h: 'Saldo', r: 1, f: e => e.calc.saldo > 0.5 ? `<span class="neg">${cop(e.calc.saldo)}</span>` : '<span class="muted">$0</span>' },
    { h: 'Estado', f: e => `<div class="pills">${chip(tone[e.ref.estado || 'Pendiente'], e.ref.estado || 'Pendiente')}${e.calc.saldo <= 0.5 ? chip('good', 'Pagado', 'check') : ''}</div>` },
  ], E, { act: e => editAttr('ventas', e.id), empty: '<p>No hay pedidos en este período.</p>' });
  const dir = new Map();
  for (const e of all) {
    const c = e.ref.cliente || {};
    const key = String(c.celular || '').replace(/\D/g, '') || (c.nombre || '').toLowerCase();
    const r = dir.get(key) || { nombre: c.nombre || 'Sin nombre', celular: c.celular || '', municipio: c.municipio || '', n: 0, total: 0, ultima: '' };
    r.n++; r.total += e.ingreso; if ((e.fecha || '') > r.ultima) r.ultima = e.fecha; dir.set(key, r);
  }
  const dt = table([
    { h: 'Cliente', f: r => `<span class="cell-strong">${esc(r.nombre)}</span><span class="sub">${esc(r.municipio)}</span>` },
    { h: 'Celular', f: r => `<span class="num">${esc(r.celular || '—')}</span>` },
    { h: '', f: r => waLink(r.celular) },
    { h: 'Pedidos', r: 1, f: r => num(r.n, 0) },
    { h: 'Comprado', r: 1, f: r => cop(r.total) },
    { h: 'Último', r: 1, f: r => fmtDate(r.ultima) },
  ], [...dir.values()].sort((a, b) => b.total - a.total));
  return `${head}${kp}${card('Pedidos', t)}
    <div class="grid g-2-1">${card('Ventas y utilidad', trendLegend() + trendChart(R, E, [], { h: 200 }))}${card('Directorio de clientes', dt, { sub: 'Todos los clientes finales, de mayor a menor compra.' })}</div>`;
};

/* ---------- La Pinera ---------- */
VIEW_FN.pinera = R => {
  const M = model(), cfg = M.cfg;
  const head = `<div class="section-h"><p>Estado de cuenta con La Pinera: cada compra de madera (y lo que la pinera pague por ti, como aserrío o flete) suma a la deuda; cada pago la baja.</p>
    <div class="acts">${addBtn('Compra o cargo', 'pinera-compra', 'primary sm')}${addBtn('Pago', 'pinera-pago')}</div></div>`;
  if (!M.ledger.length) return head + card('', emptyState('Todavía no hay movimientos con la pinera', 'Registra las remisiones de madera (rastras y valor) y los abonos que le haces. El saldo se calcula solo.', addBtn('Compra a la pinera', 'pinera-compra', ''))) + costosCard(cfg);
  const L = M.ledger.filter(m => inR(m.fecha, R));
  const compras = L.filter(m => m.tipo === 'cargo'), pagos = L.filter(m => m.tipo === 'pago');
  const madera = compras.filter(m => (m.ref.concepto || 'Madera') === 'Madera' && m.rastras > 0);
  const prom = sum(madera, m => m.rastras) ? sum(madera, m => m.valor) / sum(madera, m => m.rastras) : 0;
  const kp = `<div class="kpis">
    ${kpi('Saldo hoy', cop(Math.abs(M.pineraSaldo)), M.pineraSaldo >= 0 ? 'Le debes a la pinera' : 'A tu favor (pagaste de más)', { cls: M.pineraSaldo > 0 ? '' : 'pos' })}
    ${kpi('Compras del período', cop(sum(compras, m => m.valor)), `${num(sum(compras, m => m.rastras))} rastras · ${compras.length} movimientos`)}
    ${kpi('Pagos del período', cop(sum(pagos, m => m.valor)), `${pagos.length} pagos`)}
    ${kpi('Precio promedio por rastra', cop(prom), 'Solo madera, en el período')}
  </div>`;
  // saldo al final de cada tramo del rango
  const B = bucketize(R);
  const vals = B.keys.map((k, i) => {
    const end = i + 1 < B.keys.length ? addDays(B.keys[i + 1], -1) : R.to;
    let s = 0; for (const m of M.ledger) if ((m.fecha || '') <= end) s = m.saldo; return s;
  });
  const ch = chartSlot({ type: 'line', labels: B.keys, fmtX: B.label, tipX: B.tipLabel, fmtY: v => cop(v, true), fmtTip: v => cop(v), aria: 'Saldo con la pinera', series: [{ label: 'Saldo', color: 'var(--s2)', values: vals, area: true }] }, 210);
  const t = table([
    { h: 'Fecha', f: m => `<span class="num">${fmtDate(m.fecha)}</span>` },
    { h: 'Concepto', f: m => m.tipo === 'pago' ? `${chip('good', 'Pago')}<span class="sub">${esc(m.ref.medio || '')} ${esc(m.ref.nota || '')}</span>` : `${esc(m.ref.concepto || 'Madera')}<span class="sub">${esc([m.ref.salida, m.ref.destino].filter(Boolean).join(' → '))}${m.ref.nota ? ' · ' + esc(m.ref.nota) : ''}</span>` },
    { h: 'Remisión', f: m => `<span class="num">${esc(m.ref.remision || '—')}</span>` },
    { h: 'Rastras', r: 1, f: m => m.rastras ? num(m.rastras, 4) : '—' },
    { h: '$/rastra', r: 1, f: m => m.rastras ? cop(m.valor / m.rastras) : '—' },
    { h: 'Cargo', r: 1, f: m => m.tipo === 'cargo' ? cop(m.valor) : '' },
    { h: 'Pago', r: 1, f: m => m.tipo === 'pago' ? cop(m.valor) : '' },
    { h: 'Saldo', r: 1, f: m => `<b class="${m.saldo < 0 ? 'pos' : ''}">${cop(m.saldo)}</b>` },
  ], L.slice().reverse(), { act: m => editAttr(m.col, m.ref.id), empty: '<p>No hay movimientos en este período.</p>' });
  return `${head}${kp}
    ${card('Saldo en el tiempo', ch, { sub: 'Por encima de cero le debes a la pinera; por debajo, tienes saldo a favor.' })}
    ${card('Estado de cuenta', t, { sub: 'Del más reciente al más antiguo. El saldo es acumulado desde el primer movimiento.' })}
    ${costosCard(cfg)}`;
};

function costosCard(cfg) {
  const t = (Array.isArray(cfg.pinera) && cfg.pinera.length ? cfg.pinera : PINERA_2026).slice().sort((a, b) => a.hasta - b.hasta);
  const mo = manoObra(cfg);
  let desde = 0;
  const rows = t.map(r => { const o = { desde, hasta: n(r.hasta), valor: n(r.valor) }; desde = +(n(r.hasta) + 0.1).toFixed(1); return o; });
  const tb = table([
    { h: 'Largo', f: r => `<span class="num">${num(r.desde, 1)} – ${num(r.hasta, 1)} m</span>` },
    { h: 'Pinera / rastra', r: 1, f: r => cop(r.valor) },
    { h: 'Mano de obra', r: 1, f: r => cop(mo) },
    { h: 'Costo real / rastra', r: 1, f: r => `<b>${cop(r.valor + mo)}</b>` },
  ], rows);
  return card('Costo real por rastra', tb, { sub: `Precio de la pinera según el largo + aserrada ${cop(cfg.aserrada)} + arriada ${cop(cfg.arriada)}. Una rastra = ancho × grueso (pulgadas) × largo (m) ÷ 240.`, acts: btn(`${icon('edit')}Editar costos`, 'data-act="form" data-form="costos"', 'sm') });
}

/* ---------- Gastos ---------- */
VIEW_FN.gastos = R => {
  const M = model();
  const head = `<div class="section-h"><p>Gastos que no están en el costo por rastra: fletes, cargues, combustible, comisiones. Se restan de la utilidad neta del período.</p><div class="acts">${addBtn('Gasto', 'gasto', 'primary sm')}</div></div>`;
  const G = M.d.gastos.filter(g => inR(g.fecha, R)).sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
  if (!M.d.gastos.length) return head + card('', emptyState('Todavía no hay gastos', 'Registra fletes, cargues y otros gastos para que la utilidad neta sea la real.', addBtn('Gasto', 'gasto', '')));
  const tot = sum(G, g => g.valor);
  const byCat = new Map(); for (const g of G) byCat.set(g.categoria || 'Otro', (byCat.get(g.categoria || 'Otro') || 0) + n(g.valor));
  const cats = [...byCat.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const kp = `<div class="kpis k3">
    ${kpi('Gastos del período', cop(tot), `${G.length} registros`)}
    ${kpi('Categoría más alta', cats[0] ? esc(cats[0].label) : '—', cats[0] ? `${cop(cats[0].value)} · ${pct(cats[0].value / tot)}` : '', { cls: 'sm' })}
    ${kpi('Promedio por día', cop(tot / (diffDays(R.from, R.to) + 1)), 'En el rango elegido', { cls: 'sm' })}
  </div>`;
  const t = table([
    { h: 'Fecha', f: g => `<span class="num">${fmtDate(g.fecha)}</span>` },
    { h: 'Categoría', f: g => esc(g.categoria || 'Otro') },
    { h: 'Descripción', f: g => `${esc(g.descripcion || '')}<span class="sub">${esc(g.canal || 'General')}</span>` },
    { h: 'Valor', r: 1, f: g => cop(g.valor) },
  ], G, { act: g => editAttr('gastos', g.id), empty: '<p>No hay gastos en este período.</p>', foot: G.length > 1 ? ['Total', '', '', cop(tot)] : null });
  return `${head}${kp}<div class="grid g-2-1">${card('Gastos', t)}${card('Por categoría', cats.length ? hbars(cats, { fmt: v => cop(v, true), color: 'var(--s2)' }) : '<p class="muted">Sin gastos en el período.</p>')}</div>`;
};

/* ---------- Precios y costos ---------- */
const medSort = (a, b) => { const A = parseMedida(a), B = parseMedida(b); if (!A || !B) return String(a).localeCompare(String(b)); return (A.a * A.b - B.a * B.b) || (A.a - B.a); };
function listaDims(l) {
  const meds = Object.keys(l.precios || {}).sort(medSort);
  const ls = new Set(); for (const m of meds) for (const k of Object.keys(l.precios[m] || {})) if (n(l.precios[m][k])) ls.add(+k / 100);
  return { meds, largos: [...ls].sort((a, b) => a - b) };
}
function calcRows(M, medida, largo, cant) {
  const info = piezaInfo(medida, largo, M.cfg);
  if (!info) return null;
  const rows = M.d.listas.map(l => {
    const pr = listaPrecio(l, medida, largo);
    return { nombre: l.nombre, precio: pr, util: pr - info.costo, margen: pr ? (pr - info.costo) / pr : NaN };
  });
  return { info, rows, cant: Math.max(1, n(cant) || 1) };
}
function calcOut(M, medida, largo, cant) {
  const r = calcRows(M, medida, largo, cant);
  if (!r) return `<p class="muted">Escribe una medida como <b>4x6</b> y un largo en metros como <b>3</b>.</p>`;
  const { info, rows, cant: q } = r;
  const head = `<div class="kpis k3" style="margin-bottom:14px">
    ${kpi('Rastras por pieza', num(info.rastras, 4), `${num(info.a, 2)} × ${num(info.b, 2)} × ${num(info.L, 2)} ÷ 240`, { cls: 'sm' })}
    ${kpi('Costo real por pieza', cop(info.costo), `Pinera ${cop(pineraRate(info.L, M.cfg))} + mano de obra ${cop(manoObra(M.cfg))} por rastra`, { cls: 'sm' })}
    ${kpi(`Para ${num(q, 0)} ${q === 1 ? 'pieza' : 'piezas'}`, cop(info.costo * q), `${num(info.rastras * q, 3)} rastras`, { cls: 'sm' })}
  </div>`;
  const t = table([
    { h: 'Lista', f: x => esc(x.nombre) },
    { h: 'Precio / pza', r: 1, f: x => x.precio ? cop(x.precio) : '<span class="muted">No está</span>' },
    { h: 'Utilidad / pza', r: 1, f: x => x.precio ? signed(x.util) : '' },
    { h: 'Margen', r: 1, f: x => x.precio ? `<span class="${x.margen < 0 ? 'neg' : ''}">${pct(x.margen)}</span>` : '' },
    { h: `Total ${num(q, 0)} pzs`, r: 1, f: x => x.precio ? cop(x.precio * q) : '' },
    { h: 'Utilidad total', r: 1, f: x => x.precio ? signed(x.util * q) : '' },
  ], rows, { empty: '<p>Agrega una lista de precios para comparar.</p>' });
  return head + t;
}
VIEW_FN.precios = () => {
  const M = model(), cfg = M.cfg;
  const L = M.d.listas.slice().sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const calc = card('Calculadora de pieza', `<div class="form-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:16px">
      <div class="field"><label for="calc-m">Medida (pulgadas)</label><input id="calc-m" data-calc value="${esc(S.calc?.m ?? '4x6')}" placeholder="4x6" list="dl-medidas"></div>
      <div class="field"><label for="calc-l">Largo (m)</label><input id="calc-l" data-calc class="qty" inputmode="decimal" value="${esc(S.calc?.l ?? '3')}" placeholder="3"></div>
      <div class="field"><label for="calc-q">Cantidad</label><input id="calc-q" data-calc class="qty" inputmode="decimal" value="${esc(S.calc?.q ?? '1')}" placeholder="1"></div>
    </div><div id="calc-out">${calcOut(M, S.calc?.m ?? '4x6', parseQty(S.calc?.l ?? '3'), parseQty(S.calc?.q ?? '1'))}</div>${datalistMedidas(M)}`,
    { sub: 'Rastras, costo real y lo que te deja cada lista de precios para una pieza.' });

  const sel = L.find(l => l.id === S.listaSel) || L[0];
  const listas = table([
    { h: 'Lista', f: l => `<span class="cell-strong">${esc(l.nombre)}</span><span class="sub">${esc(l.nota || '')}</span>` },
    { h: 'Medidas', r: 1, f: l => num(listaDims(l).meds.length, 0) },
    { h: 'Largos', f: l => { const d = listaDims(l); return d.largos.length ? `<span class="num">${num(d.largos[0])} – ${num(d.largos[d.largos.length - 1])} m</span>` : '—'; } },
    { h: 'Se usa en', f: l => { const u = []; if (cfg.listaBB === l.id || (!cfg.listaBB && M.listaBB && M.listaBB.id === l.id)) u.push(cfg.punto); if (cfg.listaFinal === l.id) u.push('Cliente final'); for (const c of M.d.clientes) if (c.listaId === l.id) u.push(c.nombre); return u.length ? esc(u.join(', ')) : '<span class="muted">Sin asignar</span>'; } },
    { h: '', r: 1, f: l => `<div class="pills" style="justify-content:flex-end">${btn('Ver', `data-act="lista-ver" data-id="${esc(l.id)}"`, 'sm ghost')}${btn('Editar', `data-act="edit" data-col="listas" data-id="${esc(l.id)}"`, 'sm')}</div>` },
  ], L, { empty: emptyState('Sin listas de precios', 'Crea una lista pegando la tabla desde Excel: medidas arriba y largos a la izquierda.', addBtn('Lista de precios', 'lista', '')) });

  let matrix = '';
  if (sel) {
    const d = listaDims(sel);
    const mode = S.matrixMode || 'precio';
    const cells = (med, L0) => {
      const pr = n((sel.precios[med] || {})[largoKey(L0)]);
      if (!pr) return '<td class="r muted">·</td>';
      if (mode === 'precio') return `<td class="r">${Math.round(pr).toLocaleString('es-CO')}</td>`;
      const info = piezaInfo(med, L0, cfg); const mg = info ? (pr - info.costo) / pr : NaN;
      return `<td class="r ${mg < 0 ? 'neg' : ''}">${Number.isFinite(mg) ? (mg * 100).toFixed(0) + '%' : '—'}</td>`;
    };
    matrix = card(`Lista: ${esc(sel.nombre)}`, `<div class="pills" style="margin-bottom:12px">
        <button type="button" class="pill" data-act="mx" data-m="precio" aria-pressed="${mode === 'precio'}">Precio por pieza</button>
        <button type="button" class="pill" data-act="mx" data-m="margen" aria-pressed="${mode === 'margen'}">Margen sobre costo real</button></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Largo</th>${d.meds.map(m => `<th class="r">${esc(m)}</th>`).join('')}</tr></thead>
      <tbody>${d.largos.map(L0 => `<tr><td class="n"><b>${num(L0)} m</b></td>${d.meds.map(m => cells(m, L0)).join('')}</tr>`).join('')}</tbody></table></div>`,
      { sub: mode === 'precio' ? 'Precio por pieza en pesos.' : 'Margen = (precio − costo real) ÷ precio. En rojo, lo que se vende por debajo del costo.' });
  }

  const conf = `<div class="ledger">
    <div><span>Socio y punto de venta</span><b>${esc(cfg.socio)} · ${esc(cfg.punto)}</b></div>
    <div><span>Tu parte de la utilidad del punto</span><b>${num(cfg.pctSocio, 0)}%</b></div>
    <div><span>Lista de precio de sociedad</span><b>${esc(M.listaBB ? M.listaBB.nombre : 'Sin asignar')}</b></div>
    <div><span>Lista para cliente final</span><b>${esc(M.listas.get(cfg.listaFinal)?.nombre || 'Sin asignar')}</b></div>
    <div><span>Días de crédito por defecto</span><b>${num(cfg.diasCredito, 0)} días</b></div>
    <div><span>Aviso de inventario bajo</span><b>${num(cfg.stockMin, 0)} piezas</b></div>
  </div>`;

  return `<div class="section-h"><p>Así se calcula todo el tablero: una rastra es ancho × grueso × largo ÷ 240, y el costo real de cada rastra es el precio de la pinera según el largo más la mano de obra.</p>
      <div class="acts">${addBtn('Lista de precios', 'lista', 'sm')}${btn(`${icon('edit')}Sociedad y crédito`, 'data-act="form" data-form="config"', 'sm')}</div></div>
    ${calc}
    <div class="grid g-1-1">${costosCard(cfg)}${card('Sociedad y crédito', conf, { acts: btn(`${icon('edit')}Editar`, 'data-act="form" data-form="config"', 'sm') })}</div>
    ${card('Listas de precios', listas, { sub: 'Cada cliente mayorista usa una lista. Barro Blanco usa la lista de sociedad.' })}
    ${matrix}`;
};
function datalistMedidas(M) {
  const set = new Set();
  for (const l of M.d.listas) for (const m of Object.keys(l.precios || {})) set.add(m);
  return `<datalist id="dl-medidas">${[...set].sort(medSort).map(m => `<option value="${esc(m)}"></option>`).join('')}</datalist>`;
}

/* ---------- Datos ---------- */
VIEW_FN.datos = () => {
  const M = model();
  const counts = COLS.map(c => [c, S.data[c].length]);
  const where = S.mode === 'db'
    ? 'Tus datos viven en la base de datos privada de este tablero en Claude. Los ves desde cualquier computador o celular entrando con tu cuenta, y Claude también puede leerlos y cargarlos por ti.'
    : 'Abriste el archivo fuera de Claude. Lo que registres se guarda solo en este navegador; exporta una copia para no perderla.';
  const NOMBRES = { listas: 'Listas de precios', clientes: 'Clientes mayoristas', ventas: 'Pedidos (mayoristas y finales)', abonos: 'Abonos de mayoristas', bbDespachos: 'Despachos a Barro Blanco', bbVentas: 'Ventas de Barro Blanco', bbPagos: 'Pagos de Barro Blanco', pineraCompras: 'Compras a la pinera', pineraPagos: 'Pagos a la pinera', gastos: 'Gastos' };
  return `<div class="grid g-1-1">
    ${card('Dónde están tus datos', `<p style="color:var(--fg-2);margin-bottom:12px">${where}</p><div class="ledger">${counts.map(([c, k]) => `<div><span>${NOMBRES[c]}</span><b>${num(k, 0)}</b></div>`).join('')}</div>`)}
    <div class="stack">
      ${card('Copia de seguridad', `<p style="color:var(--fg-2);margin-bottom:12px">Descarga todo en un archivo para guardarlo o abrirlo en Excel.</p>
        <div class="pills">${btn(`${icon('down')}Todo (JSON)`, 'data-act="export-json"', '')}${btn(`${icon('down')}Ventas en Excel (CSV)`, 'data-act="export-csv"', '')}</div>`)}
      ${card('Restaurar una copia', `<p style="color:var(--fg-2);margin-bottom:12px">Carga un archivo JSON exportado desde este tablero. Los registros con el mismo identificador se reemplazan; los demás se agregan.</p>
        <div id="import-zone">${btn(`${icon('up')}Elegir archivo`, 'data-act="import"', '')}</div>`)}
      ${card('Cargar información con Claude', `<p style="color:var(--fg-2)">En el chat con Claude puedes mandar fotos de remisiones, pantallazos de WhatsApp con lo que vendió ${esc(M.cfg.socio)}, o Excel con abonos. Claude los convierte en registros de este tablero y te dice qué cargó.</p>`)}
    </div></div>`;
};

/* =========================================================================
   Formularios
   ========================================================================= */
const fld = (id, label, input, o = {}) => `<div class="field ${o.full ? 'full' : ''}"><label for="${id}">${label}</label>${input}${o.hint ? `<span class="hint">${o.hint}</span>` : ''}</div>`;
const inp = (id, v, o = {}) => `<input id="${id}" name="${id}" value="${esc(v ?? '')}"${o.type ? ` type="${o.type}"` : ''}${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}${o.im ? ` inputmode="${o.im}"` : ''}${o.list ? ` list="${o.list}"` : ''}>`;
const moneyF = (id, v, o = {}) => inp(id, moneyIn(v), { ...o, cls: 'money', im: 'numeric', ph: o.ph ?? '$0' });
const qtyF = (id, v, o = {}) => inp(id, qtyIn(v), { ...o, cls: 'qty', im: 'decimal' });
const dateF = (id, v) => inp(id, v || todayStr(), { type: 'date' });
const selF = (id, v, opts) => `<select id="${id}" name="${id}">${opts.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(val) === String(v ?? '') ? ' selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
const areaF = (id, v, ph = '') => `<textarea id="${id}" name="${id}" placeholder="${esc(ph)}">${esc(v || '')}</textarea>`;
const val = (f, id) => (f.querySelector('#' + id)?.value ?? '').trim();

function parseLoose(s) {
  let t = String(s ?? '').replace(/[^\d.,-]/g, '');
  if (!t || t === '-') return 0;
  if (/^-?\d{1,3}([.,]\d{3})+$/.test(t)) t = t.replace(/[.,]/g, '');
  else if (/^-?\d{1,3}(\.\d{3})+,\d+$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(,\d{3})+\.\d+$/.test(t)) t = t.replace(/,/g, '');
  else t = t.replace(',', '.');
  const x = parseFloat(t);
  return Number.isFinite(x) ? x : 0;
}

/* ---- líneas de piezas ---- */
function lineRow(mode, l = {}) {
  const isR = l.unidad === 'rastra';
  const keep = l.medida ? ` data-costo="${n(l.costo)}" data-rastras="${n(l.rastras)}"` : '';
  return `<div class="line ${mode === 'bbv' ? 'm-bbv' : 'm-sale'}" data-line${keep}>
    <div class="field f-prod"><label>Medida y largo (m)</label><div style="display:grid;grid-template-columns:minmax(0,1fr) 76px;gap:6px">
      <input data-k="medida" value="${esc(isR ? 'rastras' : (l.medida || ''))}" placeholder="4x6" list="dl-medidas" aria-label="Medida en pulgadas" autocomplete="off">
      <input data-k="largo" class="qty" inputmode="decimal" value="${esc(qtyIn(l.largo))}" placeholder="m" aria-label="Largo en metros"></div></div>
    <div class="field"><label>${isR ? 'Rastras' : 'Cant.'}</label><input data-k="cant" class="qty" inputmode="decimal" value="${esc(qtyIn(l.cant))}" placeholder="0" aria-label="Cantidad"></div>
    <div class="field"><label>${mode === 'bbv' ? 'Precio venta' : 'Precio c/u'}</label><input data-k="precio" class="money" inputmode="numeric" value="${esc(moneyIn(l.precio))}" placeholder="$0" data-auto="${n(l.precio) ? 0 : 1}" aria-label="Precio por unidad"></div>
    ${mode === 'bbv' ? `<div class="field"><label>Precio sociedad</label><input data-k="pbb" class="money" inputmode="numeric" value="${esc(moneyIn(l.pbb))}" placeholder="$0" data-auto="${n(l.pbb) ? 0 : 1}" aria-label="Precio de sociedad"></div>` : ''}
    <button type="button" class="icon-btn" data-act="rm-line" aria-label="Quitar pieza">${icon('x')}</button>
    <div class="lsub" data-sub></div>
  </div>`;
}
function linesBlock(mode, items, title = 'Piezas') {
  const rows = (items && items.length ? items : [{}]).map(l => lineRow(mode, l)).join('');
  return `<div class="form-sec"><h4>${title}</h4><span class="muted" style="font-size:11.5px">Escribe “rastras” en medida para cargar por rastras sin detalle</span></div>
    <div class="lines" id="lines" data-mode="${mode}">${rows}</div>
    <div>${btn(`${icon('plus')}Agregar pieza`, 'data-act="add-line"', 'sm')}</div>`;
}
function readRow(row, mode) {
  const g = k => (row.querySelector(`[data-k="${k}"]`)?.value ?? '').trim();
  const medTxt = g('medida'), largo = parseQty(g('largo')), cant = parseQty(g('cant')), precio = parseMoney(g('precio'));
  if (/^r(astras?)?$/i.test(medTxt)) {
    return { unidad: 'rastra', medida: 'Rastras', largo, cant, precio, rastras: 1, costo: row.dataset.costo ? n(row.dataset.costo) : Math.round(costoRastra(largo || 3)), ok: true };
  }
  const info = piezaInfo(medTxt, largo);
  const l = {
    unidad: 'pieza', medida: info ? info.label : medTxt, largo, cant, precio,
    rastras: row.dataset.rastras ? n(row.dataset.rastras) : info ? +info.rastras.toFixed(6) : 0,
    costo: row.dataset.costo ? n(row.dataset.costo) : info ? Math.round(info.costo) : 0,
    ok: !!info,
  };
  if (mode === 'bbv') l.pbb = parseMoney(g('pbb'));
  return l;
}
function readLines(form, mode) {
  const out = [];
  for (const row of $$('[data-line]', form)) {
    const l = readRow(row, mode);
    if (!l.medida && !l.cant) continue;
    if (!l.cant) continue;
    if (!l.ok) throw new Error(`La medida “${l.medida || '(vacía)'}” no se entiende. Escríbela como 4x6 y pon el largo en metros.`);
    delete l.ok; out.push(l);
  }
  return out;
}

/* ---- precios automáticos ---- */
function listaCliente(form) {
  const M = model();
  const c = M.cli.get(val(form, 'f-cliente'));
  return c ? M.listas.get(c.listaId) : null;
}
function pbbFor(med, L) {
  const M = model();
  const pz = parseMedida(med);
  if (pz) { const r = M.inv.get(`${pz.key}|${largoKey(L)}`); if (r && r.pbb) return r.pbb; }
  return listaPrecio(M.listaBB, med, L);
}
function autoPrice(form, row) {
  const F = FORMS[S.form.kind];
  const med = row.querySelector('[data-k="medida"]').value, L = parseQty(row.querySelector('[data-k="largo"]').value);
  const pIn = row.querySelector('[data-k="precio"]');
  if (pIn && pIn.dataset.auto === '1' && F.priceFor) { const v = F.priceFor(form, med, L); pIn.value = v ? moneyIn(v) : ''; }
  const bIn = row.querySelector('[data-k="pbb"]');
  if (bIn && bIn.dataset.auto === '1') { const v = pbbFor(med, L); bIn.value = v ? moneyIn(v) : ''; }
}

/* ---- totales en vivo ---- */
function liveSale(form, mode, extra = {}) {
  const rows = $$('[data-line]', form);
  let pzs = 0, ras = 0, sub = 0, costo = 0;
  for (const row of rows) {
    const l = readRow(row, mode);
    const s = row.querySelector('[data-sub]');
    if (!l.ok || !l.cant) { s.textContent = l.medida && !l.ok ? 'Medida no válida: usa el formato 4x6' : ''; continue; }
    const lineSub = l.cant * l.precio, lineCost = l.cant * l.costo;
    if (l.unidad !== 'rastra') pzs += l.cant;
    ras += l.cant * l.rastras; sub += lineSub; costo += lineCost;
    s.textContent = l.unidad === 'rastra'
      ? `costo ${cop(l.costo)}/rastra · subtotal ${cop(lineSub)}`
      : `${num(l.rastras, 4)} rastras/pza · costo ${cop(l.costo)}/pza · subtotal ${cop(lineSub)}`;
  }
  return { pzs, ras, sub, costo };
}
function liveBBV(form) {
  const p = n(CFG().pctSocio) / 100;
  let venta = 0, base = 0, costo = 0, ras = 0, pzs = 0;
  for (const row of $$('[data-line]', form)) {
    const l = readRow(row, 'bbv'); const s = row.querySelector('[data-sub]');
    if (!l.ok || !l.cant) { s.textContent = l.medida && !l.ok ? 'Medida no válida: usa el formato 4x6' : ''; continue; }
    const v = l.cant * l.precio, b = l.cant * l.pbb;
    venta += v; base += b; costo += l.cant * l.costo; ras += l.cant * l.rastras; if (l.unidad !== 'rastra') pzs += l.cant;
    s.textContent = `${num(l.rastras, 4)} rastras/pza · utilidad del punto ${cop(v - b)} · tu parte ${cop((v - b) * p)}`;
  }
  const up = venta - base, mi = up * p;
  return { venta, base, up, mi, socio: up - mi, debe: base + mi, costo, miU: base + mi - costo, ras, pzs, p };
}
const totalsBox = rows => `<div class="totals"><div class="ledger">${rows.map(([k, v, t]) => `<div class="${t ? 'total' : ''}"><span>${k}</span><b>${v}</b></div>`).join('')}</div></div>`;

/* ---- definiciones ---- */
const FORMS = {};
const commonNote = r => fld('f-nota', 'Nota', areaF('f-nota', r.nota, 'Opcional'), { full: true });

FORMS['venta-mayorista'] = {
  col: 'ventas', eyebrow: 'Mayoristas', title: 'Nuevo pedido de mayorista', cta: 'Guardar pedido', done: 'Pedido guardado',
  init: () => ({ canal: 'mayorista', fecha: todayStr(), items: [] }),
  body: r => {
    const M = model();
    const cls = M.d.clientes.map(c => [c.id, c.nombre]);
    return `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-remision', 'Remisión', inp('f-remision', r.remision, { ph: 'N.º de remisión' }))}
      ${fld('f-cliente', 'Cliente', cls.length ? selF('f-cliente', r.clienteId || cls[0][0], cls) : `<div class="note">Primero crea el cliente en Mayoristas.</div>`, { full: true, hint: 'El precio sale de la lista de este cliente. Puedes cambiarlo en cada pieza.' })}
    </div>${linesBlock('sale', r.items)}
    <div class="form-grid">
      ${fld('f-flete', 'Flete cobrado al cliente', moneyF('f-flete', r.flete), { hint: 'Se suma al total' })}
      ${fld('f-costoFlete', 'Flete que pagaste', moneyF('f-costoFlete', r.costoFlete), { hint: 'Se resta de la utilidad' })}
      ${commonNote(r)}
    </div><div id="live"></div>${datalistMedidas(M)}`;
  },
  priceFor: (form, med, L) => listaPrecio(listaCliente(form), med, L),
  live: form => {
    const t = liveSale(form, 'sale');
    const fl = parseMoney(val(form, 'f-flete')), cf = parseMoney(val(form, 'f-costoFlete'));
    const tot = t.sub + fl, ut = tot - t.costo - cf;
    return totalsBox([['Piezas', num(t.pzs, 0)], ['Rastras', num(t.ras, 3)], ['Subtotal piezas', cop(t.sub)], ['Total del pedido', cop(tot), 1], ['Costo real (pinera + mano de obra + flete)', cop(t.costo + cf)], ['Utilidad', `${signed(ut)} · ${pct(tot ? ut / tot : NaN)}`, 1]]);
  },
  read: (f, r) => ({ ...r, canal: 'mayorista', fecha: val(f, 'f-fecha'), remision: val(f, 'f-remision'), clienteId: val(f, 'f-cliente'), items: readLines(f, 'sale'), flete: parseMoney(val(f, 'f-flete')), costoFlete: parseMoney(val(f, 'f-costoFlete')), nota: val(f, 'f-nota') }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha del pedido.' : !d.clienteId ? 'Elige el cliente.' : !d.items.length ? 'Agrega al menos una pieza con cantidad.' : '',
};

FORMS['venta-final'] = {
  col: 'ventas', eyebrow: 'Cliente final', title: 'Nuevo pedido de cliente final', cta: 'Guardar pedido', done: 'Pedido guardado',
  init: () => ({ canal: 'final', fecha: todayStr(), estado: 'Pendiente', cliente: {}, items: [], pagos: [] }),
  body: r => {
    const c = r.cliente || {};
    return `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-estado', 'Estado de la entrega', selF('f-estado', r.estado || 'Pendiente', ESTADOS_FINAL))}
      ${fld('f-nombre', 'Nombre del cliente', inp('f-nombre', c.nombre, { ph: 'Nombre y apellido' }))}
      ${fld('f-celular', 'Celular', inp('f-celular', c.celular, { ph: '300 000 0000', im: 'tel' }))}
      ${fld('f-municipio', 'Municipio', inp('f-municipio', c.municipio, { ph: 'Rionegro, Guarne…' }))}
      ${fld('f-direccion', 'Dirección de entrega', inp('f-direccion', c.direccion, { ph: 'Vereda, finca, dirección' }))}
    </div>${linesBlock('sale', r.items)}
    <div class="form-grid">
      ${fld('f-flete', 'Domicilio cobrado', moneyF('f-flete', r.flete), { hint: 'Se suma al total' })}
      ${fld('f-costoFlete', 'Flete que pagaste', moneyF('f-costoFlete', r.costoFlete), { hint: 'Se resta de la utilidad' })}
    </div>
    <div class="form-sec"><h4>Pagos recibidos</h4></div>
    <div class="pagos" id="pagos">${(r.pagos || []).map(pagoRow).join('')}</div>
    <div>${btn(`${icon('plus')}Agregar pago`, 'data-act="add-pago"', 'sm')}</div>
    <div class="form-grid">${commonNote(r)}</div><div id="live"></div>${datalistMedidas(model())}`;
  },
  priceFor: (form, med, L) => listaPrecio(model().listas.get(CFG().listaFinal), med, L),
  live: form => {
    const t = liveSale(form, 'sale');
    const fl = parseMoney(val(form, 'f-flete')), cf = parseMoney(val(form, 'f-costoFlete'));
    const tot = t.sub + fl, ut = tot - t.costo - cf;
    const pag = sum($$('[data-pago]', form), row => parseMoney(row.querySelector('[data-k="valor"]').value));
    return totalsBox([['Piezas', num(t.pzs, 0)], ['Rastras', num(t.ras, 3)], ['Total del pedido', cop(tot), 1], ['Costo real', cop(t.costo + cf)], ['Utilidad', `${signed(ut)} · ${pct(tot ? ut / tot : NaN)}`], ['Pagado', cop(pag)], ['Saldo por cobrar', cop(Math.max(0, tot - pag)), 1]]);
  },
  read: (f, r) => ({
    ...r, canal: 'final', fecha: val(f, 'f-fecha'), estado: val(f, 'f-estado'),
    cliente: { nombre: val(f, 'f-nombre'), celular: val(f, 'f-celular'), municipio: val(f, 'f-municipio'), direccion: val(f, 'f-direccion') },
    items: readLines(f, 'sale'), flete: parseMoney(val(f, 'f-flete')), costoFlete: parseMoney(val(f, 'f-costoFlete')),
    pagos: $$('[data-pago]', f).map(row => ({ fecha: row.querySelector('[data-k="fecha"]').value, valor: parseMoney(row.querySelector('[data-k="valor"]').value) })).filter(p => p.valor > 0),
    nota: val(f, 'f-nota'),
  }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha del pedido.' : !d.cliente.nombre ? 'Escribe el nombre del cliente.' : !d.items.length ? 'Agrega al menos una pieza con cantidad.' : '',
};
const pagoRow = p => `<div class="pago" data-pago><input type="date" data-k="fecha" value="${esc(p.fecha || todayStr())}" aria-label="Fecha del pago"><input data-k="valor" class="money" inputmode="numeric" value="${esc(moneyIn(p.valor))}" placeholder="$0" aria-label="Valor del pago"><button type="button" class="icon-btn" data-act="rm-row" aria-label="Quitar pago">${icon('x')}</button></div>`;

const payForm = (o) => ({
  col: o.col, eyebrow: o.eyebrow, title: o.title, cta: 'Guardar pago', done: 'Pago guardado',
  init: () => ({ fecha: todayStr(), medio: 'Transferencia' }),
  body: r => `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-valor', 'Valor', moneyF('f-valor', r.valor))}
      ${o.cliente ? fld('f-cliente', 'Cliente', selF('f-cliente', r.clienteId || model().d.clientes[0]?.id, model().d.clientes.map(c => [c.id, c.nombre])), { full: true }) : ''}
      ${fld('f-medio', 'Medio', selF('f-medio', r.medio || 'Transferencia', MEDIOS))}
      ${commonNote(r)}
    </div><div id="live"></div>`,
  live: form => o.live ? o.live(form) : '',
  read: (f, r) => ({ ...r, fecha: val(f, 'f-fecha'), valor: parseMoney(val(f, 'f-valor')), medio: val(f, 'f-medio'), nota: val(f, 'f-nota'), ...(o.cliente ? { clienteId: val(f, 'f-cliente') } : {}) }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha.' : !(d.valor > 0) ? 'Escribe el valor.' : (o.cliente && !d.clienteId) ? 'Elige el cliente.' : '',
});
FORMS['abono'] = payForm({
  col: 'abonos', eyebrow: 'Mayoristas', title: 'Abono de mayorista', cliente: true,
  live: form => { const k = model().cartera.get(val(form, 'f-cliente')); return k ? `<div class="note">Saldo actual de ${esc(k.cliente.nombre)}: <b>${cop(k.saldo)}</b>${k.vencido > 0.5 ? ` · vencido ${cop(k.vencido)}` : ''}</div>` : ''; },
});
FORMS['bb-pago'] = payForm({ col: 'bbPagos', eyebrow: 'Barro Blanco', title: 'Pago de Rubén', live: () => `<div class="note">${esc(CFG().socio)} te debe hoy <b>${cop(Math.max(0, model().bbSaldo))}</b>.</div>` });
FORMS['pinera-pago'] = payForm({ col: 'pineraPagos', eyebrow: 'La Pinera', title: 'Pago a la pinera', live: () => `<div class="note">Saldo con la pinera hoy: <b>${cop(model().pineraSaldo)}</b>.</div>` });

FORMS['cliente'] = {
  col: 'clientes', eyebrow: 'Mayoristas', title: 'Nuevo cliente mayorista', cta: 'Guardar cliente', done: 'Cliente guardado',
  init: () => ({ tipo: 'mayorista', diasCredito: CFG().diasCredito }),
  body: r => {
    const L = model().d.listas.map(l => [l.id, l.nombre]);
    return `<div class="form-grid">
      ${fld('f-nombre', 'Nombre', inp('f-nombre', r.nombre, { ph: 'Madera San Fermín' }), { full: true })}
      ${fld('f-contacto', 'Contacto', inp('f-contacto', r.contacto, { ph: 'Persona con quien hablas' }))}
      ${fld('f-celular', 'Celular', inp('f-celular', r.celular, { im: 'tel' }))}
      ${fld('f-ciudad', 'Municipio', inp('f-ciudad', r.ciudad))}
      ${fld('f-dias', 'Días de crédito', qtyF('f-dias', r.diasCredito))}
      ${fld('f-lista', 'Lista de precios', selF('f-lista', r.listaId || '', [['', 'Sin lista (precio manual)'], ...L]), { full: true })}
      ${commonNote(r)}
    </div>`;
  },
  read: (f, r) => ({ ...r, tipo: 'mayorista', nombre: val(f, 'f-nombre'), contacto: val(f, 'f-contacto'), celular: val(f, 'f-celular'), ciudad: val(f, 'f-ciudad'), diasCredito: parseQty(val(f, 'f-dias')), listaId: val(f, 'f-lista'), nota: val(f, 'f-nota') }),
  validate: d => !d.nombre ? 'Escribe el nombre del cliente.' : '',
};

const despForm = tipo => ({
  col: 'bbDespachos', eyebrow: 'Barro Blanco', title: tipo === 'devolucion' ? 'Devolución del punto' : 'Despacho a Barro Blanco',
  cta: 'Guardar', done: tipo === 'devolucion' ? 'Devolución guardada' : 'Despacho guardado',
  init: () => ({ tipo, fecha: todayStr(), items: [] }),
  body: r => `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-remision', 'Remisión', inp('f-remision', r.remision, { ph: 'N.º de relación de despacho' }))}
    </div>
    ${tipo === 'devolucion' ? '<div class="note">Piezas que vuelven del punto (o se dañaron). Se descuentan del inventario de Barro Blanco.</div>' : ''}
    ${linesBlock('sale', r.items, tipo === 'devolucion' ? 'Piezas devueltas' : 'Piezas despachadas')}
    <div class="form-grid">
      ${tipo === 'devolucion' ? '' : fld('f-costoFlete', 'Flete que pagaste', moneyF('f-costoFlete', r.costoFlete), { hint: 'Regístralo también en Gastos si quieres restarlo de la utilidad' })}
      ${commonNote(r)}
    </div><div id="live"></div>${datalistMedidas(model())}`,
  priceFor: (form, med, L) => pbbFor(med, L),
  live: form => {
    const t = liveSale(form, 'sale');
    return totalsBox([['Piezas', num(t.pzs, 0)], ['Rastras', num(t.ras, 3)], ['Valor a precio de sociedad', cop(t.sub), 1], ['Tu costo real', cop(t.costo)], ['Ganas en el precio de sociedad', `${signed(t.sub - t.costo)} · ${pct(t.sub ? (t.sub - t.costo) / t.sub : NaN)}`]]);
  },
  read: (f, r) => ({ ...r, tipo, fecha: val(f, 'f-fecha'), remision: val(f, 'f-remision'), items: readLines(f, 'sale'), costoFlete: parseMoney(val(f, 'f-costoFlete')), nota: val(f, 'f-nota') }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha.' : !d.items.length ? 'Agrega al menos una pieza con cantidad.' : '',
});
FORMS['bb-despacho'] = despForm('despacho');
FORMS['bb-devolucion'] = despForm('devolucion');

FORMS['bb-venta'] = {
  col: 'bbVentas', eyebrow: 'Barro Blanco', title: 'Venta reportada por Rubén', cta: 'Guardar venta', done: 'Venta guardada',
  init: () => ({ fecha: todayStr(), items: [], pct: n(CFG().pctSocio) }),
  body: r => `<div class="form-grid">
      ${fld('f-fecha', 'Fecha de la venta', dateF('f-fecha', r.fecha))}
      ${fld('f-pct', 'Tu parte de la utilidad (%)', qtyF('f-pct', r.pct ?? CFG().pctSocio))}
    </div>
    <div class="note">Escribe lo que ${esc(CFG().socio)} vendió y a qué precio. El precio de sociedad sale del último despacho de esa pieza.</div>
    ${linesBlock('bbv', r.items, 'Piezas vendidas')}
    <div class="form-grid">${commonNote(r)}</div><div id="live"></div>${datalistMedidas(model())}`,
  priceFor: () => 0,
  live: form => {
    const t = liveBBV(form);
    const p = n(parseQty(val(form, 'f-pct')));
    return totalsBox([['Venta en el punto', cop(t.venta)], ['Precio de sociedad', cop(t.base)], ['Utilidad del punto', signed(t.up)], [`Tu parte (${num(p, 0)}%)`, signed(t.up * p / 100)], [`Parte de ${esc(CFG().socio)}`, signed(t.up * (100 - p) / 100)], [`${esc(CFG().socio)} te liquida`, cop(t.base + t.up * p / 100), 1], ['Tu costo real', cop(t.costo)], ['Tu utilidad real', signed(t.base + t.up * p / 100 - t.costo), 1]]);
  },
  read: (f, r) => ({ ...r, fecha: val(f, 'f-fecha'), pct: parseQty(val(f, 'f-pct')), items: readLines(f, 'bbv'), nota: val(f, 'f-nota') }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha de la venta.' : !d.items.length ? 'Agrega al menos una pieza vendida.' : d.items.some(l => !l.precio) ? 'Falta el precio de venta en alguna pieza.' : '',
};

FORMS['pinera-compra'] = {
  col: 'pineraCompras', eyebrow: 'La Pinera', title: 'Compra o cargo de la pinera', cta: 'Guardar', done: 'Movimiento guardado',
  init: () => ({ fecha: todayStr(), concepto: 'Madera' }),
  body: r => `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-concepto', 'Concepto', selF('f-concepto', r.concepto || 'Madera', PINERA_CONCEPTOS))}
      ${fld('f-remision', 'Remisión', inp('f-remision', r.remision))}
      ${fld('f-salida', 'Salida', inp('f-salida', r.salida, { ph: 'Minas, Sarza…', list: 'dl-salidas' }))}
      ${fld('f-destino', 'Destino', inp('f-destino', r.destino, { ph: 'Guarne, El Carmen…', list: 'dl-destinos' }))}
      ${fld('f-rastras', 'Rastras', qtyF('f-rastras', r.rastras), { hint: 'Déjalo vacío si es aserrío, flete u otro cargo' })}
      ${fld('f-valor', 'Valor total', moneyF('f-valor', r.valor), { full: true })}
      ${commonNote(r)}
    </div><div id="live"></div>
    <datalist id="dl-salidas">${[...new Set(model().d.pineraCompras.map(x => x.salida).filter(Boolean))].map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>
    <datalist id="dl-destinos">${[...new Set(model().d.pineraCompras.map(x => x.destino).filter(Boolean))].map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>`,
  live: form => { const r = parseQty(val(form, 'f-rastras')), v = parseMoney(val(form, 'f-valor')); return r && v ? `<div class="note">Equivale a <b>${cop(v / r)}</b> por rastra.</div>` : ''; },
  read: (f, r) => ({ ...r, fecha: val(f, 'f-fecha'), concepto: val(f, 'f-concepto'), remision: val(f, 'f-remision'), salida: val(f, 'f-salida'), destino: val(f, 'f-destino'), rastras: parseQty(val(f, 'f-rastras')), valor: parseMoney(val(f, 'f-valor')), nota: val(f, 'f-nota') }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha.' : !(d.valor > 0) ? 'Escribe el valor total.' : '',
};

FORMS['gasto'] = {
  col: 'gastos', eyebrow: 'Gastos', title: 'Nuevo gasto', cta: 'Guardar gasto', done: 'Gasto guardado',
  init: () => ({ fecha: todayStr(), categoria: 'Flete', canal: 'General' }),
  body: r => `<div class="form-grid">
      ${fld('f-fecha', 'Fecha', dateF('f-fecha', r.fecha))}
      ${fld('f-valor', 'Valor', moneyF('f-valor', r.valor))}
      ${fld('f-categoria', 'Categoría', selF('f-categoria', r.categoria || 'Flete', GASTO_CATS))}
      ${fld('f-canal', 'Asociado a', selF('f-canal', r.canal || 'General', GASTO_CANAL))}
      ${fld('f-desc', 'Descripción', inp('f-desc', r.descripcion, { ph: 'Flete a Rionegro, cargue…' }), { full: true })}
      ${commonNote(r)}
    </div>
    <div class="note">El aserrío y la arriería ya están en el costo por rastra. Regístralos aquí solo si son un cobro extra.</div>`,
  read: (f, r) => ({ ...r, fecha: val(f, 'f-fecha'), valor: parseMoney(val(f, 'f-valor')), categoria: val(f, 'f-categoria'), canal: val(f, 'f-canal'), descripcion: val(f, 'f-desc'), nota: val(f, 'f-nota') }),
  validate: d => !isDate(d.fecha) ? 'Pon la fecha.' : !(d.valor > 0) ? 'Escribe el valor.' : '',
};

function parseGrid(txt) {
  const rows = String(txt || '').replace(/\r/g, '').split('\n').map(r => r.split('\t'));
  const hi = rows.findIndex(r => r.filter(c => parseMedida(c)).length >= 2);
  if (hi < 0) return { error: 'No encontré una fila con medidas (por ejemplo 2x4, 4x6). Copia la tabla desde Excel con la fila de medidas incluida.' };
  const header = rows[hi].map(c => parseMedida(c));
  const precios = {}; let celdas = 0; const largos = new Set();
  for (const r of rows.slice(hi + 1)) {
    const L = parseQty(r[0]);
    if (!L || L > 30) continue;
    r.forEach((c, j) => {
      if (!j || !header[j]) return;
      const v = Math.round(parseLoose(c));
      if (!(v > 0)) return;
      (precios[header[j].key] = precios[header[j].key] || {})[largoKey(L)] = v; celdas++; largos.add(L);
    });
  }
  if (!celdas) return { error: 'Encontré las medidas pero ningún precio. La primera columna debe tener los largos en metros.' };
  return { precios, celdas, medidas: Object.keys(precios).length, largos: largos.size };
}
FORMS['lista'] = {
  col: 'listas', eyebrow: 'Precios', title: 'Nueva lista de precios', cta: 'Guardar lista', done: 'Lista guardada',
  init: () => ({ precios: {} }),
  body: r => {
    const d = listaDims(r);
    return `<div class="form-grid">
      ${fld('f-nombre', 'Nombre de la lista', inp('f-nombre', r.nombre, { ph: 'San Fermín, Sociedad Barro Blanco…' }), { full: true })}
      ${fld('f-nota', 'Nota', inp('f-nota', r.nota, { ph: 'Vigencia, condiciones…' }), { full: true })}
      ${fld('f-grid', d.meds.length ? 'Reemplazar precios (opcional)' : 'Pega la tabla desde Excel', areaF('f-grid', '', 'Copia en Excel el bloque con las medidas en la primera fila y los largos en la primera columna, y pégalo aquí.'), { full: true, hint: d.meds.length ? `Hoy tiene ${d.meds.length} medidas y ${d.largos.length} largos. Si pegas una tabla nueva, reemplaza todos los precios.` : 'Precios por pieza en pesos.' })}
      ${d.meds.length ? fld('f-ajuste', 'Ajustar todos los precios (%)', qtyF('f-ajuste', ''), { hint: 'Ej.: 5 sube 5%, -3 baja 3%. Déjalo vacío para no cambiar.' }) : ''}
    </div><div id="live"></div>`;
  },
  live: form => {
    const g = val(form, 'f-grid');
    if (!g) return '';
    const p = parseGrid(g);
    return p.error ? `<div class="form-err">${esc(p.error)}</div>` : `<div class="note">Leí <b>${p.medidas}</b> medidas, <b>${p.largos}</b> largos y <b>${p.celdas}</b> precios.</div>`;
  },
  read: (f, r) => {
    let precios = r.precios || {};
    const g = val(f, 'f-grid');
    if (g) { const p = parseGrid(g); if (p.error) throw new Error(p.error); precios = p.precios; }
    const aj = parseQty(val(f, 'f-ajuste'));
    if (aj) { const k = 1 + aj / 100; precios = Object.fromEntries(Object.entries(precios).map(([m, row]) => [m, Object.fromEntries(Object.entries(row).map(([L, v]) => [L, Math.round(n(v) * k)]))])); }
    return { ...r, nombre: val(f, 'f-nombre'), nota: val(f, 'f-nota'), precios };
  },
  validate: d => !d.nombre ? 'Ponle un nombre a la lista.' : !Object.keys(d.precios || {}).length ? 'Pega la tabla de precios desde Excel.' : '',
};

FORMS['config'] = {
  eyebrow: 'Precios', title: 'Sociedad y crédito', cta: 'Guardar', done: 'Configuración guardada',
  init: () => ({ ...CFG() }),
  body: r => {
    const L = [['', 'Sin asignar'], ...model().d.listas.map(l => [l.id, l.nombre])];
    return `<div class="form-grid">
      ${fld('f-socio', 'Socio', inp('f-socio', r.socio))}
      ${fld('f-punto', 'Punto de venta', inp('f-punto', r.punto))}
      ${fld('f-pct', 'Tu parte de la utilidad del punto (%)', qtyF('f-pct', r.pctSocio), { hint: 'Solo aplica a ventas nuevas. Cada venta guarda su porcentaje.' })}
      ${fld('f-dias', 'Días de crédito por defecto', qtyF('f-dias', r.diasCredito))}
      ${fld('f-listaBB', 'Lista de precio de sociedad', selF('f-listaBB', r.listaBB, L))}
      ${fld('f-listaFinal', 'Lista para cliente final', selF('f-listaFinal', r.listaFinal, L))}
      ${fld('f-stock', 'Avisar cuando queden (piezas)', qtyF('f-stock', r.stockMin))}
    </div>`;
  },
  read: (f, r) => ({ socio: val(f, 'f-socio') || 'Rubén', punto: val(f, 'f-punto') || 'Barro Blanco', pctSocio: parseQty(val(f, 'f-pct')), diasCredito: parseQty(val(f, 'f-dias')), listaBB: val(f, 'f-listaBB'), listaFinal: val(f, 'f-listaFinal'), stockMin: parseQty(val(f, 'f-stock')) }),
  validate: d => d.pctSocio < 0 || d.pctSocio > 100 ? 'El porcentaje debe estar entre 0 y 100.' : '',
  save: d => Store.saveConfig(d),
};

const tramoRow = t => `<div class="pago" data-tramo><input data-k="hasta" class="qty" inputmode="decimal" value="${esc(qtyIn(t.hasta))}" placeholder="Hasta (m)" aria-label="Largo hasta en metros"><input data-k="valor" class="money" inputmode="numeric" value="${esc(moneyIn(t.valor))}" placeholder="$ por rastra" aria-label="Precio por rastra"><button type="button" class="icon-btn" data-act="rm-row" aria-label="Quitar tramo">${icon('x')}</button></div>`;
FORMS['costos'] = {
  eyebrow: 'Precios', title: 'Costo real por rastra', cta: 'Guardar costos', done: 'Costos guardados',
  init: () => ({ ...CFG() }),
  body: r => `<div class="form-grid">
      ${fld('f-aserrada', 'Mano de obra de aserrada / rastra', moneyF('f-aserrada', r.aserrada))}
      ${fld('f-arriada', 'Mano de obra de arriada / rastra', moneyF('f-arriada', r.arriada))}
    </div>
    <div class="form-sec"><h4>Precio de la pinera por rastra según el largo</h4></div>
    <div class="note">Cada tramo va desde el largo del tramo anterior hasta el largo que escribas.</div>
    <div class="pagos" id="tramos">${(Array.isArray(r.pinera) && r.pinera.length ? r.pinera : PINERA_2026).slice().sort((a, b) => a.hasta - b.hasta).map(tramoRow).join('')}</div>
    <div>${btn(`${icon('plus')}Agregar tramo`, 'data-act="add-tramo"', 'sm')}</div>`,
  read: f => ({ aserrada: parseMoney(val(f, 'f-aserrada')), arriada: parseMoney(val(f, 'f-arriada')), pinera: $$('[data-tramo]', f).map(row => ({ hasta: parseQty(row.querySelector('[data-k="hasta"]').value), valor: parseMoney(row.querySelector('[data-k="valor"]').value) })).filter(t => t.hasta > 0 && t.valor > 0).sort((a, b) => a.hasta - b.hasta) }),
  validate: d => !d.pinera.length ? 'Deja al menos un tramo de largo con su precio.' : '',
  save: d => Store.saveConfig(d),
};

const EDIT_KIND = {
  ventas: r => r.canal === 'final' ? 'venta-final' : 'venta-mayorista', abonos: () => 'abono', clientes: () => 'cliente',
  bbDespachos: r => r.tipo === 'devolucion' ? 'bb-devolucion' : 'bb-despacho', bbVentas: () => 'bb-venta', bbPagos: () => 'bb-pago',
  pineraCompras: () => 'pinera-compra', pineraPagos: () => 'pinera-pago', gastos: () => 'gasto', listas: () => 'lista',
};

function openForm(kind, rec) {
  const F = FORMS[kind]; if (!F) return;
  const r = rec ? clone(rec) : F.init();
  S.form = { kind, rec: r, isNew: !rec };
  const base = F.title.replace(/^Nuev[oa] /, '');
  const title = rec ? `Editar ${base.charAt(0).toLowerCase()}${base.slice(1)}` : F.title;
  $('#form').innerHTML = `<header><div><div class="eyebrow">${F.eyebrow}${S.demo ? ' · ejemplo' : ''}</div><h2>${esc(title)}</h2></div><button type="button" class="icon-btn" data-act="close" aria-label="Cerrar">${icon('x')}</button></header>
    <div class="panel-b"><div class="form-err" id="form-err" hidden></div>${F.body(r)}</div>
    <footer>${rec && F.col ? '<button type="button" class="btn danger" data-act="del">Eliminar</button>' : ''}<span class="sp"></span><button type="button" class="btn ghost" data-act="close">Cancelar</button><button type="submit" class="btn primary" id="f-submit">${rec ? 'Guardar cambios' : (F.cta || 'Guardar')}</button></footer>`;
  $('#drawer').hidden = false;
  document.body.style.overflow = 'hidden';
  recalcForm();
  setTimeout(() => { const el = $('#form .panel-b input, #form .panel-b select'); if (el) el.focus(); }, 40);
}
function openEdit(col, id) {
  const rec = (D()[col] || []).find(x => x.id === id);
  if (!rec) { toast('No encontré ese registro.'); return; }
  openForm(EDIT_KIND[col](rec), rec);
}
function closeForm() { $('#drawer').hidden = true; S.form = null; document.body.style.overflow = ''; }
function recalcForm() {
  if (!S.form) return;
  const F = FORMS[S.form.kind], form = $('#form');
  const live = form.querySelector('#live');
  if (live && F.live) { try { live.innerHTML = F.live(form); } catch (e) { live.innerHTML = ''; } }
}
function formError(msg) { const el = $('#form-err'); if (!el) return; el.textContent = msg; el.hidden = !msg; if (msg) el.scrollIntoView({ block: 'nearest' }); }

async function submitForm(e) {
  e.preventDefault();
  if (!S.form) return;
  const F = FORMS[S.form.kind], form = $('#form');
  if (S.demo) { formError('Estás viendo el ejemplo. Sal del ejemplo para registrar datos reales.'); return; }
  if (S.mode === 'loading') { formError('Todavía me estoy conectando con tu base de datos. Intenta en unos segundos.'); return; }
  let data;
  try { data = F.read(form, S.form.rec); } catch (err) { formError(err.message); return; }
  const v = F.validate ? F.validate(data) : '';
  if (v) { formError(v); return; }
  const b = $('#f-submit'); b.disabled = true;
  try {
    if (F.save) await F.save(data); else await Store.save(F.col, data);
    closeForm(); toast(F.done || 'Guardado');
  } catch (err) { formError(errMsg(err)); }
  finally { b.disabled = false; }
}
let delTimer = 0;
async function armDelete(b) {
  if (!b.classList.contains('armed')) {
    b.classList.add('armed'); b.textContent = 'Confirmar eliminación';
    clearTimeout(delTimer); delTimer = setTimeout(() => { b.classList.remove('armed'); b.textContent = 'Eliminar'; }, 4000);
    return;
  }
  if (S.demo) { formError('Estás viendo el ejemplo. Sal del ejemplo para cambiar datos.'); return; }
  const F = FORMS[S.form.kind], r = S.form.rec;
  if (F.col === 'clientes' && D().ventas.some(v => v.clienteId === r.id)) { formError('Este cliente tiene pedidos. Borra o cambia esos pedidos antes de eliminarlo.'); return; }
  b.disabled = true;
  try { await Store.remove(F.col, r.id); closeForm(); toast('Eliminado'); }
  catch (err) { formError(errMsg(err)); b.disabled = false; }
}

/* =========================================================================
   Exportar e importar
   ========================================================================= */
async function saveFile(filename, text) {
  let dl = null;
  try { dl = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null; } catch { dl = null; }
  if (dl) {
    try { await dl.save({ filename, data: text }); toast('Archivo listo'); }
    catch (e) { if (!e || e.code !== 'declined') toast('No se pudo preparar la descarga.'); }
    return;
  }
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
    a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800);
  } catch { toast('Este navegador no permitió la descarga.'); }
}
function exportJSON() {
  const payload = { app: 'tablero-agrohermanos', version: 1, exportado: new Date().toISOString(), config: S.config };
  for (const c of COLS) payload[c] = S.data[c];
  saveFile(`agrohermanos-${todayStr()}.json`, JSON.stringify(payload, null, 2));
}
function exportCSV() {
  const M = model();
  const q = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const nn = v => String(Math.round(n(v) * 10000) / 10000).replace('.', ',');
  const head = ['Fecha', 'Canal', 'Cliente', 'Remisión', 'Medida', 'Largo (m)', 'Cantidad', 'Rastras', 'Precio unitario', 'Venta línea', 'Costo real', 'Utilidad línea'];
  const rows = [head];
  for (const e of M.entries.slice().reverse()) for (const l of e.lines) {
    rows.push([e.fecha, CANAL[e.canal].label, e.cliente, e.ref.remision || '', l.unidad === 'rastra' ? 'Rastras' : l.medida, nn(l.largo), nn(l.cant), nn(l.rastrasT), nn(l.precio), nn(l.ingreso), nn(l.costoT), nn(l.util)]);
  }
  saveFile(`agrohermanos-ventas-${todayStr()}.csv`, '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n'));
}
let pendingImport = null;
function handleImportFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const j = JSON.parse(rd.result);
      if (!j || typeof j !== 'object' || !COLS.some(c => Array.isArray(j[c]))) throw new Error('formato');
      pendingImport = j;
      const total = sum(COLS, c => Array.isArray(j[c]) ? j[c].length : 0);
      $('#import-zone').innerHTML = `<div class="note" style="margin-bottom:10px">El archivo trae <b>${num(total, 0)}</b> registros${j.exportado ? ` (exportado el ${esc(fmtDate(String(j.exportado).slice(0, 10)))})` : ''}.</div>
        <div class="pills">${btn('Restaurar ahora', 'data-act="import-go"', 'primary')}${btn('Cancelar', 'data-act="import-cancel"', 'ghost')}</div>`;
    } catch { toast('Ese archivo no es una copia de este tablero.'); }
  };
  rd.readAsText(file);
}
async function runImport() {
  if (!pendingImport) return;
  if (S.demo) { toast('Sal del ejemplo para restaurar una copia.'); return; }
  const j = pendingImport; pendingImport = null;
  let done = 0;
  try {
    for (const c of COLS) for (const rec of (Array.isArray(j[c]) ? j[c] : [])) {
      if (!rec || typeof rec !== 'object') continue;
      await Store.save(c, { ...rec, id: rec.id || uid() }); done++;
      if (done % 20 === 0) toast(`Restaurando… ${done}`);
    }
    if (j.config && typeof j.config === 'object') await Store.saveConfig(j.config);
    toast(`Listo: ${done} registros restaurados`);
  } catch (e) { toast(`Se restauraron ${done} registros. ${errMsg(e)}`); }
  render();
}

/* =========================================================================
   Datos de ejemplo (solo en memoria, nunca se guardan)
   ========================================================================= */
const DEMO = {
  _d: null,
  get data() { return this._d || (this._d = buildDemo()); },
};
function buildDemo() {
  let seed = 7;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const hoy = todayStr();
  const meds = ['2x4', '3x5', '4x4', '4x6', '4x8', '5x8', '6x6', '6x8', '6x9'];
  const largos = [3, 3.5, 4, 4.5, 5, 6];
  const BBREF = [['2x4', 3], ['3x5', 3], ['4x4', 3], ['4x4', 4], ['4x6', 4], ['4x8', 5], ['6x6', 3.5], ['6x8', 5], ['6x9', 6]];
  const mk = (k) => { const precios = {}; for (const m of meds) { precios[m] = {}; for (const L of largos) { const c = piezaInfo(m, L, DEFAULT_CONFIG).costo; precios[m][largoKey(L)] = Math.round(c * k(L) / 100) * 100; } } return precios; };
  const listas = [
    { id: 'demo-l1', nombre: 'Sociedad Barro Blanco (ejemplo)', precios: mk(L => 1.12 + L * .012) },
    { id: 'demo-l2', nombre: 'Mayorista (ejemplo)', precios: mk(L => 1.22 + L * .015) },
    { id: 'demo-l3', nombre: 'Cliente final (ejemplo)', precios: mk(L => 1.5 + L * .02) },
  ];
  const clientes = [
    { id: 'demo-c1', tipo: 'mayorista', nombre: 'Depósito El Roble (ejemplo)', diasCredito: 30, listaId: 'demo-l2' },
    { id: 'demo-c2', tipo: 'mayorista', nombre: 'Maderas La Ceja (ejemplo)', diasCredito: 15, listaId: 'demo-l2' },
  ];
  const linea = (lista, factor = 1) => {
    const m = pick(meds), L = pick(largos), info = piezaInfo(m, L, DEFAULT_CONFIG);
    return { unidad: 'pieza', medida: m, largo: L, cant: int(4, 30), precio: Math.round(listaPrecio(lista, m, L) * factor), rastras: +info.rastras.toFixed(6), costo: Math.round(info.costo) };
  };
  const ventas = [], abonos = [], bbDespachos = [], bbVentas = [], bbPagos = [], pineraCompras = [], pineraPagos = [], gastos = [];
  let i = 0;
  for (let d = -150; d <= 0; d++) {
    const f = addDays(hoy, d);
    if (rnd() < .22) { const c = pick(clientes); ventas.push({ id: 'dv' + (i++), canal: 'mayorista', clienteId: c.id, fecha: f, remision: String(300 + i), items: Array.from({ length: int(1, 4) }, () => linea(listas[1])) }); }
    if (rnd() < .2) { const c = pick(clientes); abonos.push({ id: 'da' + (i++), clienteId: c.id, fecha: f, valor: int(20, 70) * 100000, medio: pick(MEDIOS) }); }
    if (rnd() < .1) {
      const items = Array.from({ length: int(1, 2) }, () => { const l = linea(listas[2]); l.cant = int(2, 12); return l; });
      const tot = sum(items, l => l.cant * l.precio);
      ventas.push({ id: 'dv' + (i++), canal: 'final', fecha: f, estado: d < -5 ? 'Entregado' : pick(ESTADOS_FINAL), cliente: { nombre: pick(['Juan Pérez', 'Luz Marina Gómez', 'Carlos Restrepo', 'Ana Ochoa', 'Pedro Zuluaga']) + ' (ejemplo)', celular: '300 000 00' + int(10, 99), municipio: pick(['Rionegro', 'Guarne', 'La Ceja', 'El Carmen']), direccion: 'Vereda ejemplo' }, items, flete: pick([0, 80000, 120000]), costoFlete: pick([0, 60000, 90000]), pagos: d < -10 || rnd() < .5 ? [{ fecha: f, valor: tot }] : [] });
    }
    if (d % 21 === -150 % 21) bbDespachos.push({ id: 'dd' + (i++), tipo: 'despacho', fecha: f, remision: 'BB-' + i, items: BBREF.map(([m, L]) => { const info = piezaInfo(m, L, DEFAULT_CONFIG); return { unidad: 'pieza', medida: m, largo: L, cant: int(8, 16), precio: listaPrecio(listas[0], m, L), rastras: +info.rastras.toFixed(6), costo: Math.round(info.costo) }; }) });
    if (d > -145 && rnd() < .4 && bbDespachos.length) {
      const last = bbDespachos[bbDespachos.length - 1];
      const items = Array.from({ length: int(1, 3) }, () => pick(last.items)).map(l => ({ ...l, cant: int(1, 4), pbb: l.precio, precio: Math.round(l.precio * (1.22 + rnd() * .12) / 100) * 100 }));
      bbVentas.push({ id: 'db' + (i++), fecha: f, pct: 50, items });
    }
    if (d % 14 === -3) bbPagos.push({ id: 'dp' + (i++), fecha: f, valor: int(10, 22) * 100000, medio: 'Transferencia' });
    if (d % 7 === 0) { const r = +(35 + rnd() * 35).toFixed(4); pineraCompras.push({ id: 'dc' + (i++), fecha: f, concepto: 'Madera', remision: String(320 + i), salida: pick(['Minas', 'Sarza']), destino: 'Guarne', rastras: r, valor: Math.round(r * (140000 + rnd() * 30000)) }); }
    if (d % 7 === -2) pineraPagos.push({ id: 'dq' + (i++), fecha: f, valor: int(55, 95) * 100000, medio: 'Transferencia', nota: 'Abono a cuenta madera' });
    if (rnd() < .15) gastos.push({ id: 'dg' + (i++), fecha: f, categoria: pick(['Flete', 'Cargue', 'Combustible', 'Comisiones']), descripcion: 'Gasto de ejemplo', valor: int(5, 40) * 10000, canal: 'General' });
  }
  return { listas, clientes, ventas, abonos, bbDespachos, bbVentas, bbPagos, pineraCompras, pineraPagos, gastos };
}

/* =========================================================================
   Eventos
   ========================================================================= */
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 3400);
}
function toggleMenu(force) {
  const m = $('#menu'), b = $('[data-act="menu"]');
  const open = force ?? m.hidden;
  m.hidden = !open; b.setAttribute('aria-expanded', String(open));
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!$('#menu').hidden && !e.target.closest('#menu') && !(t && t.dataset.act === 'menu')) toggleMenu(false);
  if (!t) return;
  const a = t.dataset.act;
  switch (a) {
    case 'nav': S.view = t.dataset.v; pref.set('view', S.view); render(); window.scrollTo(0, 0); break;
    case 'range': S.range = t.dataset.r; pref.set('range', S.range); render(); break;
    case 'menu': toggleMenu(); break;
    case 'form': toggleMenu(false); openForm(t.dataset.form); break;
    case 'edit': openEdit(t.dataset.col, t.dataset.id); break;
    case 'close': closeForm(); break;
    case 'add-line': {
      const box = $('#lines'); if (!box) break;
      box.insertAdjacentHTML('beforeend', lineRow(box.dataset.mode));
      box.lastElementChild.querySelector('input').focus(); break;
    }
    case 'rm-line': {
      const box = $('#lines'); const row = t.closest('[data-line]');
      if (box && box.children.length > 1) row.remove(); else { $$('input', row).forEach(i => { i.value = ''; }); delete row.dataset.costo; delete row.dataset.rastras; }
      recalcForm(); break;
    }
    case 'add-pago': $('#pagos').insertAdjacentHTML('beforeend', pagoRow({})); recalcForm(); break;
    case 'add-tramo': $('#tramos').insertAdjacentHTML('beforeend', tramoRow({})); break;
    case 'rm-row': t.closest('[data-pago],[data-tramo]').remove(); recalcForm(); break;
    case 'del': armDelete(t); break;
    case 'demo': S.demo = !S.demo; closeForm(); bump(); break;
    case 'cli': S.filterCli = S.filterCli === t.dataset.id ? '' : t.dataset.id; render(); break;
    case 'lista-ver': S.listaSel = t.dataset.id; render(); setTimeout(() => { const cs = $$('.card'); cs[cs.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 30); break;
    case 'mx': S.matrixMode = t.dataset.m; render(); break;
    case 'export-json': exportJSON(); break;
    case 'export-csv': exportCSV(); break;
    case 'import': $('#import-file').click(); break;
    case 'import-go': runImport(); break;
    case 'import-cancel': pendingImport = null; render(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (!$('#drawer').hidden) closeForm(); else toggleMenu(false); }
  if (e.key === 'Enter' && e.target.matches && e.target.matches('tr[data-act]')) e.target.click();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset && t.dataset.range) {
    if (t.dataset.range === 'from') S.customFrom = t.value; else S.customTo = t.value;
    if (isDate(t.value)) render();
    return;
  }
  if (t.hasAttribute && t.hasAttribute('data-calc')) {
    S.calc = { m: $('#calc-m').value, l: $('#calc-l').value, q: $('#calc-q').value };
    $('#calc-out').innerHTML = calcOut(model(), S.calc.m, parseQty(S.calc.l), parseQty(S.calc.q));
    return;
  }
  if (!S.form || !t.closest('#form')) return;
  const row = t.closest('[data-line]');
  if (row) {
    const k = t.dataset.k;
    if (k === 'medida' || k === 'largo') { delete row.dataset.costo; delete row.dataset.rastras; autoPrice($('#form'), row); }
    if (k === 'precio' || k === 'pbb') t.dataset.auto = t.value.trim() ? '0' : '1';
  }
  recalcForm();
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'import-file' && t.files && t.files[0]) { handleImportFile(t.files[0]); t.value = ''; return; }
  if (S.form && t.id === 'f-cliente') { for (const row of $$('[data-line]', $('#form'))) autoPrice($('#form'), row); recalcForm(); }
  if (S.form) recalcForm();
});
document.addEventListener('focusout', e => {
  const t = e.target;
  if (t.matches && t.matches('input.money')) { const v = parseMoney(t.value); t.value = v ? moneyIn(v) : ''; }
});
$('#form').addEventListener('submit', submitForm);
let rz = 0;
window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(drawCharts, 150); });

/* =========================================================================
   Arranque
   ========================================================================= */
(function boot() {
  S.range = pref.get('range', 'mes');
  if (!RANGES.some(r => r[0] === S.range)) S.range = 'mes';
  S.view = pref.get('view', 'resumen');
  const h = (location.hash || '').slice(1);
  if (h === 'demo') S.demo = true;
  else if (VIEWS.some(v => v.id === h)) S.view = h;
  if (!VIEWS.some(v => v.id === S.view)) S.view = 'resumen';
  renderMenu();
  render();
  Store.init();
})();

})();
