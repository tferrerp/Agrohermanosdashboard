# Tablero Agrohermanos

Tablero privado para llevar el negocio de madera estructural de Agrohermanos: ventas a mayoristas, sociedad con Barro Blanco, clientes finales, cuenta con La Pinera, gastos, y precios y costos por rastra.

## Cómo se usa

- **Dentro de Claude** (lo normal): el tablero se publica como una página privada de Claude con base de datos propia. Lo abres desde cualquier computador o celular con tu cuenta, y Claude puede cargar datos por ti (remisiones, abonos, ventas de Barro Blanco).
- **Fuera de Claude**: si abres `tablero.html` directamente en un navegador, funciona en *modo local*: los datos quedan solo en ese navegador. Usa **Datos → Copia de seguridad** para exportarlos.

## Secciones

| Sección | Qué hace |
|---|---|
| Resumen | Ventas, utilidad neta, rastras vendidas y utilidad por rastra del rango elegido; por cobrar, saldo con la pinera, inventario en Barro Blanco y alertas. |
| Mayoristas | Pedidos y abonos por cliente (San Fermín, San Nicolás). Los abonos pagan primero los pedidos más viejos para saber qué está vencido. Los pedidos *por entregar* no cuentan como venta ni deuda hasta que se entregan. |
| Barro Blanco | Despachos, ventas reportadas por Rubén, pagos, piezas dañadas (las asume la sociedad), inventario en el punto y liquidación 50/50. |
| Cliente final | Directorio de clientes finales (personas, constructoras, arquitectos) y sus pedidos con dirección, pagos y saldo. |
| Compras y gastos | Compra de madera a la pinera (estado de cuenta con saldo corrido) y gastos como fletes y cargues, que se restan de la utilidad. |
| Precios y costos | A cómo nos sale la madera (por rastra y por pieza), calculadora de pieza, listas de precios pegadas desde Excel y configuración de la sociedad. |
| Datos | Exportar a JSON o CSV, restaurar una copia y ver datos de ejemplo. |

## Cargar con Claude

Dentro de Claude, el botón **Cargar con Claude** recibe un mensaje de WhatsApp, una nota o una foto de una remisión. Claude lo convierte en registros y abre cada formulario ya lleno para revisarlo antes de guardar. Usa el `sample` de la página, que gasta del uso de Claude de quien lo abre.

## Fórmulas

- **Rastras de una pieza** = ancho (pulg.) × grueso (pulg.) × largo (m) ÷ 240.
- **Costo real por rastra** = precio de la pinera según el largo (tabla 2026) + aserrada $58.000 + arriada $6.000.
- **Costo real de una pieza** = rastras × costo real por rastra. Se guarda en cada venta, así que cambiar los costos no altera el historial.
- **Barro Blanco**: utilidad del punto = venta − precio de sociedad. Tu parte = 50% de esa utilidad. Rubén te liquida el precio de sociedad + tu parte. Tu utilidad real = lo que te liquida − tu costo real.
- **Utilidad neta** del período = Σ(venta − costo real) − gastos del período.

## Desarrollo

El código está en `src/`:

- `src/shell.html`: estilos, marca y estructura de la página.
- `src/app.js`: datos, cálculos, gráficas, vistas y formularios.

Para generar `tablero.html` (el archivo que se publica):

```sh
node build.mjs
```

### Datos

Cada colección es una lista de documentos JSON: `listas`, `clientes`, `ventas`, `abonos`, `bbDespachos`, `bbVentas`, `bbPagos`, `pineraCompras`, `pineraPagos`, `gastos`, más `config/general`. En las listas de precios, `precios[medida][largo en cm] = precio por pieza` (por ejemplo `precios["4x6"]["300"]` es una 4x6 de 3 m).
