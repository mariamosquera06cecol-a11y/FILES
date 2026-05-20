/**
 * walletEngine.js
 * Motor lógico de ADSO-Pay E-Wallet Bunker.
 * Genera historial de transacciones simuladas con datos coherentes en COP.
 */

const { faker } = require('@faker-js/faker/locale/es');

/**
 * Genera un array de transacciones bancarias simuladas en pesos colombianos.
 *
 * @param {number} count - Cantidad de transacciones a generar.
 * @returns {Array<Object>} Array de objetos de transacción.
 */
function generateTransactionHistory(count) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('count debe ser un entero positivo');
  }

  const tipos = ['Ingreso', 'Retiro'];
  const estados = ['Completado', 'Pendiente', 'Rechazado'];

  // Fecha de inicio: hace 30 días
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  return Array.from({ length: count }, () => {
    // Monto entre 10.000 y 500.000 COP, redondeado a 2 decimales
    const amount = parseFloat(
      faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 })
    );

    return {
      id: faker.string.uuid(),
      accountNumber: generateCOPAccountNumber(),
      type: faker.helpers.arrayElement(tipos),
      amount,
      date: faker.date.between({ from: hace30Dias, to: new Date() }),
      status: faker.helpers.arrayElement(estados),
    };
  });
}

/**
 * Genera un número de cuenta bancaria colombiana simulado.
 * Formato: banco (3 dígitos) + tipo (1 dígito) + número (10 dígitos)
 * Ejemplo: 001-2-1234567890
 *
 * @returns {string}
 */
function generateCOPAccountNumber() {
  const codigoBanco = faker.helpers.arrayElement([
    '001', // Banco de Bogotá
    '002', // Bancolombia
    '006', // Banco Agrario
    '007', // Bancóldex
    '013', // BBVA Colombia
    '023', // Banco de Occidente
    '032', // Banco Caja Social
    '040', // Banco Agrario
    '051', // Davivienda
    '052', // Banco AV Villas
  ]);
  const tipoCuenta = faker.helpers.arrayElement(['1', '2']); // 1=Ahorro, 2=Corriente
  const numero = faker.string.numeric(10);
  return `${codigoBanco}-${tipoCuenta}-${numero}`;
}

/**
 * Calcula el saldo neto total de una lista de transacciones.
 * Regla de negocio:
 *   - Solo se cuentan transacciones con status 'Completado'.
 *   - Los 'Ingreso' suman al saldo.
 *   - Los 'Retiro' restan al saldo.
 *
 * @param {Array<Object>} transactions
 * @returns {number} Saldo neto redondeado a 2 decimales.
 */
function calcularSaldoNeto(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error('transactions debe ser un array');
  }

  const neto = transactions.reduce((acc, tx) => {
    if (tx.status !== 'Completado') return acc;
    if (tx.type === 'Ingreso') return acc + tx.amount;
    if (tx.type === 'Retiro') return acc - tx.amount;
    return acc;
  }, 0);

  return parseFloat(neto.toFixed(2));
}

module.exports = { generateTransactionHistory, calcularSaldoNeto, generateCOPAccountNumber };
