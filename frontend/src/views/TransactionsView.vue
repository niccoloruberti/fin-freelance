<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import TransactionModal from '@/components/TransactionModal.vue'
import api from '@/services/api'
import type { Transaction, Category, Client } from '@/types'

const transactions = ref<Transaction[]>([])
const categories = ref<Category[]>([])
const clients = ref<Client[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<Transaction | null>(null)
const error = ref<string | null>(null)

const columns: Column[] = [
  {
    key: 'type',
    label: 'Tipo',
    format: (val: string) => val === 'income' ? 'Entrata' : 'Uscita',
  },
  {
    key: 'description',
    label: 'Descrizione',
  },
  {
    key: 'amount',
    label: 'Importo',
    format: (val: any, row: any) => {
      const sign = row.type === 'income' ? '+' : '-'
      return `${sign} ${Number(val).toFixed(2)} €`
    },
  },
  {
    key: 'date',
    label: 'Data',
    format: (val: string) => new Date(val).toLocaleDateString('it-IT'),
  },
  {
    key: 'category',
    label: 'Categoria',
    format: (_val: any, row: any) => row.category?.name ?? '—',
  },
  {
    key: 'client',
    label: 'Cliente',
    format: (_val: any, row: any) => row.client?.name ?? '—',
  },
]

async function fetchTransactions() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/transactions')
    transactions.value = res.data
  } catch {
    error.value = 'Errore nel caricamento delle transazioni.'
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await api.get('/categories')
    categories.value = res.data
  } catch {
    console.error('Errore nel caricamento delle categorie')
  }
}

async function fetchClients() {
  try {
    const res = await api.get('/clients')
    clients.value = res.data
  } catch {
    console.error('Errore nel caricamento dei clienti')
  }
}

function openCreate() {
  editingItem.value = null
  modalOpen.value = true
}

function openEdit(item: Record<string, any>) {
  editingItem.value = item as Transaction
  modalOpen.value = true
}

async function handleSave(data: Record<string, any>) {
  saving.value = true
  error.value = null
  try {
    if (editingItem.value) {
      await api.patch(`/transactions/${editingItem.value.id}`, data)
    } else {
      await api.post('/transactions', data)
    }
    modalOpen.value = false
    await fetchTransactions()
  } catch {
    error.value = 'Errore nel salvataggio.'
  } finally {
    saving.value = false
  }
}

async function handleDelete(item: Record<string, any>) {
  const tx = item as Transaction
  if (!confirm(`Eliminare la transazione "${tx.description}"?`)) return
  try {
    await api.delete(`/transactions/${tx.id}`)
    await fetchTransactions()
  } catch {
    error.value = "Errore nell'eliminazione."
  }
}

onMounted(() => {
  fetchTransactions()
  fetchCategories()
  fetchClients()
})
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Transazioni</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestisci le tue entrate e uscite</p>
      </div>
      <button @click="openCreate" class="btn btn-primary">
        + Nuova transazione
      </button>
    </div>

    <div v-if="error" class="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
      {{ error }}
    </div>

    <div class="card p-0 overflow-hidden">
      <CrudTable
        :columns="columns"
        :items="transactions"
        :loading="loading"
        empty-message="Nessuna transazione ancora. Creane una!"
        @edit="openEdit"
        @delete="handleDelete"
      >
        <template #cell-description="{ value, row }">
          <div class="flex items-center gap-2">
            <span>{{ value }}</span>
            <span
              v-if="row.recurringTransactionId"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600"
              title="Generata da template ricorrente"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Ricorrente
            </span>
          </div>
        </template>
      </CrudTable>
    </div>

    <TransactionModal
      :show="modalOpen"
      :initial-data="editingItem"
      :categories="categories"
      :clients="clients"
      :loading="saving"
      @save="handleSave"
      @close="modalOpen = false"
    />
  </div>
</template>
