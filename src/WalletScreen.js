/**
 * WalletScreen.js
 * Interfaz principal de ADSO-Pay E-Wallet Bunker.
 * ✔ Saldo Neto Total en cabecera
 * ✔ FlatList con 200 transacciones Faker (COP)
 * ✔ Filtro instantáneo sin parpadeo (useMemo + keyExtractor estable)
 * ✔ Verde Ingresos / Rojo Retiros
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { generateTransactionHistory, calcularSaldoNeto } = require('./walletEngine');

const TRANSACTION_COUNT = 200;
const FILTROS = { TODOS: 'Todos', INGRESOS: 'Ingreso', RETIROS: 'Retiro' };

// Generado UNA sola vez fuera del componente — no se regenera en re-renders
const ALL_TRANSACTIONS = generateTransactionHistory(TRANSACTION_COUNT);
const SALDO_NETO_TOTAL = calcularSaldoNeto(ALL_TRANSACTIONS);

const formatCOP = (amount) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const formatFecha = (date) =>
  new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const TransactionItem = React.memo(({ item }) => {
  const esIngreso = item.type === 'Ingreso';
  return (
    <View style={styles.itemContainer}>
      <View style={[styles.iconoBadge, esIngreso ? styles.badgeIngreso : styles.badgeRetiro]}>
        <Text style={styles.iconoTexto}>{esIngreso ? '↑' : '↓'}</Text>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTipo}>{item.type}</Text>
        <Text style={styles.itemCuenta} numberOfLines={1}>{item.accountNumber}</Text>
        <Text style={styles.itemFecha}>{formatFecha(item.date)}</Text>
      </View>
      <View style={styles.itemDerecha}>
        <Text style={[styles.itemMonto, esIngreso ? styles.montoIngreso : styles.montoRetiro]}>
          {esIngreso ? '+' : '-'} {formatCOP(item.amount)}
        </Text>
        <View style={[styles.estadoBadge, styles[`estado_${item.status}`]]}>
          <Text style={styles.estadoTexto}>{item.status}</Text>
        </View>
      </View>
    </View>
  );
});

export default function WalletScreen() {
  const [filtroActivo, setFiltroActivo] = useState(FILTROS.TODOS);

  const transaccionesFiltradas = useMemo(() => {
    if (filtroActivo === FILTROS.TODOS) return ALL_TRANSACTIONS;
    return ALL_TRANSACTIONS.filter((tx) => tx.type === filtroActivo);
  }, [filtroActivo]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f1e" />

      {/* CABECERA */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitulo}>ADSO-Pay · Billetera Digital</Text>
        <Text style={styles.headerLabel}>Saldo Neto Total</Text>
        <Text style={[styles.headerSaldo, SALDO_NETO_TOTAL >= 0 ? styles.saldoPositivo : styles.saldoNegativo]}>
          {formatCOP(SALDO_NETO_TOTAL)}
        </Text>
        <Text style={styles.headerConteo}>{ALL_TRANSACTIONS.length} transacciones generadas</Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosRow}>
        {Object.values(FILTROS).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBotón, filtroActivo === f && styles.filtroActivo]}
            onPress={() => setFiltroActivo(f)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filtroTexto, filtroActivo === f && styles.filtroTextoActivo]}>
              {f === FILTROS.TODOS ? 'Todos' : f === FILTROS.INGRESOS ? '↑ Ingresos' : '↓ Retiros'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA */}
      <FlatList
        data={transaccionesFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} />}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        removeClippedSubviews={true}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTexto}>No hay transacciones para este filtro.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const COLORS = {
  bg: '#0a0f1e',
  card: '#111827',
  border: '#1f2d45',
  accent: '#3b82f6',
  ingreso: '#22c55e',
  retiro: '#ef4444',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
    backgroundColor: COLORS.bg, borderBottomWidth: 1,
    borderBottomColor: COLORS.border, alignItems: 'center',
  },
  headerSubtitulo: { fontSize: 11, letterSpacing: 2, color: COLORS.accent, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600' },
  headerLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  headerSaldo: { fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  saldoPositivo: { color: COLORS.ingreso },
  saldoNegativo: { color: COLORS.retiro },
  headerConteo: { fontSize: 11, color: COLORS.textMuted },
  filtrosRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: COLORS.bg },
  filtroBotón: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', backgroundColor: COLORS.card },
  filtroActivo: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filtroTexto: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filtroTextoActivo: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, marginTop: 8, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  iconoBadge: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  badgeIngreso: { backgroundColor: 'rgba(34,197,94,0.15)' },
  badgeRetiro: { backgroundColor: 'rgba(239,68,68,0.15)' },
  iconoTexto: { fontSize: 18, fontWeight: '700' },
  itemInfo: { flex: 1, marginRight: 8 },
  itemTipo: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  itemCuenta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  itemFecha: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  itemDerecha: { alignItems: 'flex-end' },
  itemMonto: { fontSize: 13, fontWeight: '700' },
  montoIngreso: { color: COLORS.ingreso },
  montoRetiro: { color: COLORS.retiro },
  estadoBadge: { marginTop: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  estado_Completado: { backgroundColor: 'rgba(34,197,94,0.15)' },
  estado_Pendiente: { backgroundColor: 'rgba(245,158,11,0.15)' },
  estado_Rechazado: { backgroundColor: 'rgba(107,114,128,0.15)' },
  estadoTexto: { fontSize: 9, fontWeight: '600', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyContainer: { flex: 1, alignItems: 'center', paddingTop: 60 },
  emptyTexto: { color: COLORS.textMuted, fontSize: 14 },
});