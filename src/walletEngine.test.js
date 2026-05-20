/**
 * walletEngine.test.js
 * Suite TDD para el motor lógico de ADSO-Pay E-Wallet Bunker.
 * Ejecutar dentro de Docker:
 *   docker compose exec app npm test
 */

const {
  generateTransactionHistory,
  calcularSaldoNeto,
} = require('../src/walletEngine');

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 1: generateTransactionHistory
// ─────────────────────────────────────────────────────────────────────────────
describe('generateTransactionHistory()', () => {

  // PRUEBA 1 ─ Longitud exacta del array
  test('debe retornar exactamente 50 transacciones cuando se piden 50', () => {
    const result = generateTransactionHistory(50);
    expect(result).toHaveLength(50);
  });

  // PRUEBA 2 ─ Montos siempre positivos y nunca cero
  test('cada monto (amount) debe ser un número positivo mayor que cero', () => {
    const result = generateTransactionHistory(100);
    result.forEach((tx) => {
      expect(typeof tx.amount).toBe('number');
      expect(tx.amount).toBeGreaterThan(0);
    });
  });

  // PRUEBA 3 ─ Sin campos undefined
  test('ningún campo del objeto transacción debe ser undefined', () => {
    const camposEsperados = ['id', 'accountNumber', 'type', 'amount', 'date', 'status'];
    const result = generateTransactionHistory(30);

    result.forEach((tx) => {
      camposEsperados.forEach((campo) => {
        expect(tx[campo]).toBeDefined();
      });
    });
  });

  // PRUEBA 4 ─ Valores dentro de enumerados válidos
  test('type y status deben contener solo valores del enumerado permitido', () => {
    const tiposValidos = ['Ingreso', 'Retiro'];
    const estadosValidos = ['Completado', 'Pendiente', 'Rechazado'];
    const result = generateTransactionHistory(200);

    result.forEach((tx) => {
      expect(tiposValidos).toContain(tx.type);
      expect(estadosValidos).toContain(tx.status);
    });
  });

  // PRUEBA 5 ─ Monto dentro del rango COP definido (10.000 – 500.000)
  test('el monto debe estar siempre entre $10.000 y $500.000 COP', () => {
    const result = generateTransactionHistory(200);
    result.forEach((tx) => {
      expect(tx.amount).toBeGreaterThanOrEqual(10000);
      expect(tx.amount).toBeLessThanOrEqual(500000);
    });
  });

  // PRUEBA 6 ─ Fecha dentro del último mes
  test('la fecha de cada transacción debe estar dentro del último mes', () => {
    const ahora = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const result = generateTransactionHistory(50);
    result.forEach((tx) => {
      const fecha = new Date(tx.date);
      expect(fecha.getTime()).toBeGreaterThanOrEqual(hace30Dias.getTime());
      expect(fecha.getTime()).toBeLessThanOrEqual(ahora.getTime() + 1000); // +1s tolerancia
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// BLOQUE 2: calcularSaldoNeto (Regla de Negocio)
// ─────────────────────────────────────────────────────────────────────────────
describe('calcularSaldoNeto()', () => {

  // PRUEBA 7 ─ Cálculo matemático correcto con dataset fijo
  test('debe calcular el saldo neto correctamente sumando ingresos y restando retiros COMPLETADOS', () => {
    const transacciones = [
      // Deben contar
      { type: 'Ingreso',  amount: 200000, status: 'Completado' },
      { type: 'Ingreso',  amount: 150000, status: 'Completado' },
      { type: 'Retiro',   amount: 80000,  status: 'Completado' },
      // No deben contar (Pendiente / Rechazado)
      { type: 'Ingreso',  amount: 999999, status: 'Pendiente'  },
      { type: 'Retiro',   amount: 999999, status: 'Rechazado'  },
    ];

    // Esperado: 200.000 + 150.000 - 80.000 = 270.000
    const resultado = calcularSaldoNeto(transacciones);
    expect(resultado).toBe(270000);
  });

  // PRUEBA 8 ─ Saldo cero si no hay transacciones completadas
  test('debe retornar 0 cuando no existen transacciones Completadas', () => {
    const transacciones = [
      { type: 'Ingreso', amount: 500000, status: 'Pendiente'  },
      { type: 'Retiro',  amount: 300000, status: 'Rechazado'  },
    ];
    expect(calcularSaldoNeto(transacciones)).toBe(0);
  });

  // PRUEBA 9 ─ Manejo de array vacío
  test('debe retornar 0 con un array vacío sin lanzar error', () => {
    expect(calcularSaldoNeto([])).toBe(0);
  });

  // PRUEBA 10 ─ El resultado es siempre un número (no NaN, no Infinity)
  test('el saldo neto calculado sobre 500 transacciones aleatorias siempre debe ser un número finito', () => {
    const txs = generateTransactionHistory(500);
    const saldo = calcularSaldoNeto(txs);
    expect(typeof saldo).toBe('number');
    expect(isFinite(saldo)).toBe(true);
    expect(isNaN(saldo)).toBe(false);
  });
});
