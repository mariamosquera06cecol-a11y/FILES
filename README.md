# EWalletBunker – ADSO-Pay MVP

Billetera digital con TDD (Jest + Faker) corriendo completamente en Docker.

---

## 🚀 Inicio rápido (un solo comando)

```bash
docker compose up
```

Esto construye la imagen, instala dependencias dentro del contenedor y arranca Metro Bundler en `http://localhost:8081`.

---

## 🧪 Correr las pruebas Jest

Desde otra terminal (con el contenedor ya corriendo):

```bash
docker compose exec app npm test
```

O en una sola línea sin servidor previo:

```bash
docker compose run --rm app npm test
```

### Tests incluidos (10 pruebas en 2 bloques)

| # | Descripción |
|---|-------------|
| 1 | Array de exactamente 50 transacciones |
| 2 | Montos siempre positivos y > 0 |
| 3 | Ningún campo con valor `undefined` |
| 4 | `type` y `status` dentro de enumerados válidos |
| 5 | Monto entre $10.000 y $500.000 COP |
| 6 | Fecha dentro del último mes |
| 7 | Cálculo matemático correcto del saldo neto |
| 8 | Saldo 0 si no hay transacciones completadas |
| 9 | Array vacío retorna 0 sin errores |
| 10 | Saldo neto siempre es un número finito sobre 500 txs |

---

## 📁 Estructura del proyecto

```
EWalletBunker/
├── Dockerfile
├── docker-compose.yml
├── babel.config.js
├── package.json
├── App.js
└── src/
    ├── walletEngine.js        ← Motor lógico + Faker (COP)
    ├── walletEngine.test.js   ← Suite TDD (10 pruebas)
    └── WalletScreen.js        ← UI React Native
```

---

## 🏗️ Decisiones técnicas

- **Faker locale `es`**: nombres y datos en español; montos en COP entre $10.000 y $500.000.
- **Números de cuenta**: código de banco colombiano real (3 dígitos) + tipo (1=Ahorro, 2=Corriente) + número (10 dígitos).
- **Saldo neto**: solo cuenta transacciones `Completado`; `Pendiente` y `Rechazado` se ignoran.
- **Sin parpadeo en FlatList**: `keyExtractor` usa el UUID estable de Faker + `useMemo` para el filtrado → React no desmonta/monta ítems al filtrar.
- **Rendimiento**: `initialNumToRender=15`, `maxToRenderPerBatch=20`, `removeClippedSubviews=true`, `React.memo` en `TransactionItem`.
