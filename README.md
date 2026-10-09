# Tablero Agrohermanos

Tablero privado para llevar el negocio de madera estructural de Agrohermanos: ventas a mayoristas, sociedad con Barro Blanco, clientes finales, cuenta con La Pinera, gastos, y precios y costos por rastra.

## Cómo se usa

- **Dentro de Claude** (lo normal): el tablero se publica como una página privada de Claude con base de datos propia. Lo abres desde cualquier computador o celular con tu cuenta, y Claude puede cargar datos por ti (remisiones, abonos, ventas de Barro Blanco).
- **Fuera de Claude**: si abres `tablero.html` directamente en un navegador, funciona en *modo local*: los datos quedan solo en ese navegador. Usa **Datos → Copia de seguridad** para exportarlos.

## Secciones

| Sección | Qué hace |
|---|---|
| Remisiones | Cada cargue que sale: se sube la foto de la remisión, Claude saca el despiece, se confirma y se elige para quién es (un destino o repartido entre Barro Blanco, mayoristas, clientes finales o pedidos por entregar). Crea las ventas y despachos y suma la nómina del viaje. |
| Home | Ventas, utilidad neta, rastras vendidas y utilidad por rastra del rango elegido; pedidos por entregar, deudas (te deben / debes), saldo con la pinera, inventario en Barro Blanco y alertas. |
| Mayoristas | Pedidos y abonos por cliente. Los abonos pagan primero los pedidos más viejos para saber qué está vencido. Los pedidos *por entregar* no cuentan como venta ni deuda hasta que se entregan. Si un mayorista pagó de más, queda con *saldo a favor*. |
| Barro Blanco | Inventario en el punto con su valor estimado a precio de venta al cliente final, despachos sin precio, devoluciones con su motivo (dañada, no se vendió…), ventas de la sociedad (del punto o con despacho directo, entregadas o por entregar, con la diferencia contra la lista), pagos y liquidación 50/50. |
| Cliente final | Directorio de clientes finales, pedidos por entregar y despachados, y anticipos con foto del comprobante. Un pedido pendiente no cuenta como venta hasta que se despacha. |
| Compras y gastos | Compra de madera a la pinera (estado de cuenta con saldo corrido) y gastos como fletes y cargues, que se restan de la utilidad. |
| Pauta | Gasto en publicidad de Meta por campaña, con interruptor de prendida/apagada y presupuesto mensual o diario. Solo suma los días que estuvo prendida (o el cobro real del mes). |
| Nómina | Lo que se le debe a cada trabajador. Cada viaje (remisión) suma sus rastras × la tarifa de aserrada o arriada; los abonos lo bajan. Al tocar a un trabajador se ve todo su historial. |
| Precios y costos | A cómo nos sale la madera (por rastra y por pieza), calculadora de pieza, listas de precios pegadas desde Excel y configuración de la sociedad. |
| Datos | Exportar a JSON o CSV, restaurar una copia y ver datos de ejemplo. |

## Versión Google (un link propio)

La carpeta `google/` tiene la versión que se abre como un link normal de Google:

- `google/Codigo.gs`: el servidor en Google Apps Script. Se pega en *Extensiones → Apps Script* de la hoja “Tablero Agrohermanos · datos” y se publica como aplicación web (Ejecutar como: yo · Acceso: solo yo).
- `google/tablero-agrohermanos.html`: la página. El servidor la descarga de este repositorio cada vez que se abre, así que cada cambio que se sube aquí aparece solo en el link.
- Los datos quedan en la hoja de Google Sheets: una pestaña por tipo de registro. Claude puede dejar registros nuevos como archivos JSON en la carpeta “Tablero Agrohermanos · entradas” de Drive y el tablero los carga al abrirse.

## Cargar con Claude

Dentro de Claude, el botón **Cargar con Claude** recibe un mensaje de WhatsApp, una nota o una foto de una remisión. Claude lo convierte en registros y abre cada formulario ya lleno para revisarlo antes de guardar. Los formularios de pedido (mayoristas, Barro Blanco y cliente final) también tienen **Llenar con foto**, y el de anticipo lee el comprobante. Usa el `sample` de la página, que gasta del uso de Claude de quien lo abre.

Las fotos de comprobantes se guardan con el registro: dentro de Claude como archivos del tablero (`assets`), y en la versión Google en la carpeta “Tablero Agrohermanos · comprobantes” de Drive.

## Fórmulas

- **Rastras de una pieza** = ancho (pulg.) × grueso (pulg.) × largo (m) ÷ 240.
- **Costo real por rastra** = precio de la pinera según el largo + mano de obra (aserrada + arriada). Los valores reales se guardan en la configuración del tablero, no en el código.
- **Costo real de una pieza** = rastras × costo real por rastra. Se guarda en cada venta, así que cambiar los costos no altera el historial.
- **Barro Blanco**: el despacho va sin precio; la madera queda en el inventario del punto estimada a precio de venta al cliente final (lista de venta de la sociedad). El precio se pone en la venta: utilidad del punto = venta − precio de sociedad. Tu parte = 50% de esa utilidad. Rubén te liquida el precio de sociedad + tu parte. Tu utilidad real = lo que te liquida − tu costo real.
- **Lo que te deben**: un pedido confirmado ya es deuda del cliente por el total, menos lo que haya abonado o anticipado, aunque no se haya entregado. Cuenta como venta cuando se entrega.
- **Utilidad neta** del período = Σ(venta − costo real) − gastos del período (gastos registrados + pauta + trabajos extra de nómina).
- **Nómina**: cada despacho desde la fecha de arranque suma rastras × tarifa a cada trabajador. Esa plata ya está dentro del costo real, así que no se resta otra vez; solo los trabajos extra cuentan como gasto.
- **Abono pagado a un tercero**: si un mayorista le paga directo a la pinera o a un trabajador, baja su deuda y también lo que se le debe a la pinera o al trabajador.

## Desarrollo

El código está en `src/`:

- `src/shell.html`: estilos, marca y estructura de la página.
- `src/app.js`: datos, cálculos, gráficas, vistas y formularios.

Para generar `tablero.html` (el archivo que se publica):

```sh
node build.mjs
```

### Datos

Cada colección es una lista de documentos JSON: `listas`, `clientes`, `ventas`, `abonos`, `bbDespachos`, `bbVentas`, `bbPagos`, `pineraCompras`, `pineraPagos`, `gastos`, `nomina`, `anticipos`, `remisiones`, más `config/general`. En las listas de precios, `precios[medida][largo en cm] = precio por pieza` (por ejemplo `precios["4x6"]["300"]` es una 4x6 de 3 m).
