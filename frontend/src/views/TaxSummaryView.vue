<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '@/services/api'
import type { TaxSummaryDetail, MonthlyTaxData } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const summary = ref<TaxSummaryDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const years = computed(() => {
  const list = []
  for (let y = currentYear; y >= currentYear - 4; y--) list.push(y)
  return list
})

const inpsLabel = computed(() => {
  switch (summary.value?.inpsManagement) {
    case 'gestione_separata': return 'Gestione Separata INPS'
    case 'artigiani_commercianti': return 'Artigiani e Commercianti INPS'
    case 'cassa_professionale': return 'Cassa Professionale'
    default: return '—'
  }
})

const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

const chartData = computed(() => {
  const breakdown: MonthlyTaxData[] = summary.value?.monthlyBreakdown ?? []
  return {
    labels: monthNames,
    datasets: [
      {
        label: 'Entrate',
        data: breakdown.map((m: MonthlyTaxData) => m.income),
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderColor: 'rgb(13, 148, 136)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Uscite',
        data: breakdown.map(m => m.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
    tooltip: {
      callbacks: {
        label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (val: any) => `${Number(val).toLocaleString('it-IT')} €`,
      },
    },
  },
}

function fmt(value: number | undefined) {
  if (value === undefined || value === null) return '—'
  return Number(value).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function pct(rate: number) {
  return (rate * 100).toFixed(2) + '%'
}

async function fetchSummary() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/tax/summary', { params: { year: selectedYear.value } })
    summary.value = res.data
  } catch {
    error.value = 'Errore nel caricamento del riepilogo fiscale.'
  } finally {
    loading.value = false
  }
}

watch(selectedYear, fetchSummary)
onMounted(fetchSummary)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Riepilogo Fiscale</h1>
        <p class="text-sm text-gray-500 mt-0.5">Calcolo tasse e contributi per il regime forfettario</p>
      </div>
      <select
        v-model="selectedYear"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- Error -->
    <div v-if="error" class="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">{{ error }}</div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="animate-pulse space-y-6">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-24 bg-gray-200 rounded-xl"></div>
      </div>
      <div class="h-64 bg-gray-200 rounded-xl"></div>
    </div>

    <template v-else-if="summary">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <!-- Fatturato -->
        <div class="card">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Fatturato</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(summary.totalIncome) }}</p>
          <p class="text-xs text-gray-400 mt-1">Entrate anno {{ selectedYear }}</p>
        </div>

        <!-- Spese -->
        <div class="card">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Spese</p>
          <p class="text-2xl font-bold text-red-600 mt-1">{{ fmt(summary.totalExpenses) }}</p>
          <p class="text-xs text-gray-400 mt-1">Uscite anno {{ selectedYear }}</p>
        </div>

        <!-- Reddito Imponibile -->
        <div class="card">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Reddito Imponibile</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(summary.taxableIncome) }}</p>
          <p class="text-xs text-gray-400 mt-1">Fatturato × {{ summary.taxCoefficientIncome }}%</p>
        </div>

        <!-- Imposta Sostitutiva -->
        <div class="card">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Imposta Sostitutiva</p>
          <p class="text-2xl font-bold text-yellow-600 mt-1">{{ fmt(summary.substitutiveTax) }}</p>
          <p class="text-xs text-gray-400 mt-1">Aliquota {{ summary.taxRateSubstitutive }}%</p>
        </div>

        <!-- Contributi INPS -->
        <div class="card">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Contributi INPS</p>
          <p class="text-2xl font-bold text-orange-600 mt-1">{{ fmt(summary.inpsContributions) }}</p>
          <p class="text-xs text-gray-400 mt-1">{{ inpsLabel }}</p>
        </div>

        <!-- Utile Netto -->
        <div class="card" :class="summary.netIncome >= 0 ? 'border-l-4 border-teal-500' : 'border-l-4 border-red-500'">
          <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">Utile Netto</p>
          <p class="text-2xl font-bold mt-1" :class="summary.netIncome >= 0 ? 'text-teal-600' : 'text-red-600'">
            {{ fmt(summary.netIncome) }}
          </p>
          <p class="text-xs text-gray-400 mt-1">Dopo tasse e spese</p>
        </div>
      </div>

      <!-- Breakdown calcolo + Accantonamento -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        <!-- Come si calcola -->
        <div class="card lg:col-span-2">
          <h3 class="text-base font-semibold text-gray-900 mb-4">Come viene calcolata l'imposta</h3>
          <div class="space-y-3">

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">Fatturato annuo</p>
                <p class="text-xs text-gray-500">Totale entrate {{ selectedYear }}</p>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ fmt(summary.totalIncome) }}</span>
            </div>

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">× Coefficiente di redditività</p>
                <p class="text-xs text-gray-500">{{ summary.taxCoefficientIncome }}% del fatturato → reddito lordo</p>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ fmt(summary.taxableIncome) }}</span>
            </div>

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">− Contributi {{ inpsLabel }}</p>
                <p class="text-xs text-gray-500">{{ pct(summary.inpsRate) }} del reddito lordo (deducibili ex L. 190/2014 c. 64)</p>
              </div>
              <span class="text-sm font-semibold text-orange-600">− {{ fmt(summary.inpsContributions) }}</span>
            </div>

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">= Reddito netto imponibile</p>
                <p class="text-xs text-gray-500">Base per l'imposta sostitutiva</p>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ fmt(summary.netTaxableIncome) }}</span>
            </div>

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">× Aliquota sostitutiva</p>
                <p class="text-xs text-gray-500">{{ summary.taxRateSubstitutive }}% sul reddito netto imponibile</p>
              </div>
              <span class="text-sm font-semibold text-yellow-700">{{ fmt(summary.substitutiveTax) }}</span>
            </div>

            <div class="flex items-start justify-between py-2 border-b border-gray-100">
              <div>
                <p class="text-sm font-medium text-gray-800">+ Contributi {{ inpsLabel }}</p>
                <p class="text-xs text-gray-500">Versamento previdenziale</p>
              </div>
              <span class="text-sm font-semibold text-orange-600">{{ fmt(summary.inpsContributions) }}</span>
            </div>

            <div class="flex items-start justify-between py-3 bg-red-50 rounded-lg px-3">
              <div>
                <p class="text-sm font-bold text-gray-900">= Totale imposte dovute</p>
                <p class="text-xs text-gray-500">Imposta sostitutiva + contributi</p>
              </div>
              <span class="text-base font-bold text-red-600">{{ fmt(summary.totalTax) }}</span>
            </div>
          </div>
        </div>

        <!-- Scadenze acconti -->
        <div class="space-y-4">
          <!-- Badge metodo -->
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500">Metodo di calcolo:</span>
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full"
              :class="summary.accontiMethod === 'storico'
                ? 'bg-teal-100 text-teal-700'
                : 'bg-amber-100 text-amber-700'"
            >
              {{ summary.accontiMethod === 'storico' ? 'Storico' : 'Previsionale' }}
            </span>
          </div>

          <!-- 30 Giugno -->
          <div class="card border-l-4 border-primary-400">
            <div class="flex items-start justify-between mb-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">1° Acconto</p>
              <span class="text-xs font-medium text-primary-600">30 Giugno {{ selectedYear }}</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(summary.junePayment) }}</p>
            <p class="text-xs text-gray-400 mt-1">40% dell'imponibile {{ summary.accontiMethod === 'storico' ? `anno ${selectedYear - 1}` : 'stimato' }}</p>
          </div>

          <!-- 30 Novembre -->
          <div class="card border-l-4 border-orange-400">
            <div class="flex items-start justify-between mb-1">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-medium">2° Acconto</p>
              <span class="text-xs font-medium text-orange-600">30 Novembre {{ selectedYear }}</span>
            </div>
            <p class="text-2xl font-bold text-gray-900 mt-1">{{ fmt(summary.novemberPayment) }}</p>
            <p class="text-xs text-gray-400 mt-1">60% dell'imponibile {{ summary.accontiMethod === 'storico' ? `anno ${selectedYear - 1}` : 'stimato' }}</p>
          </div>

          <div class="card">
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Parametri fiscali</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Regime</span>
                <span class="font-medium text-gray-800 capitalize">{{ summary.taxRegime }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Coefficiente</span>
                <span class="font-medium text-gray-800">{{ summary.taxCoefficientIncome }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Aliquota</span>
                <span class="font-medium text-gray-800">{{ summary.taxRateSubstitutive }}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">INPS</span>
                <span class="font-medium text-gray-800">{{ pct(summary.inpsRate) }}</span>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-3">
              Modifica i parametri nelle
              <router-link to="/settings" class="text-primary-600 hover:underline">Impostazioni</router-link>.
            </p>
          </div>
        </div>
      </div>

      <!-- Grafico mensile -->
      <div class="card">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Andamento mensile {{ selectedYear }}</h3>
        <div class="h-64">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading" class="card text-center py-12">
      <p class="text-gray-500">Nessun dato disponibile per il {{ selectedYear }}.</p>
      <p class="text-sm text-gray-400 mt-1">Aggiungi transazioni per vedere il riepilogo fiscale.</p>
    </div>
  </div>
</template>
