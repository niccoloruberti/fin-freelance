<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import CrudModal, { type FieldDef } from '@/components/crud/CrudModal.vue'
import api from '@/services/api'
import type { Client, ClientStatus } from '@/types'

const items = ref<Client[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<Client | null>(null)
const error = ref<string | null>(null)
const activeFilter = ref<ClientStatus | 'all'>('all')

const STATUS_CONFIG: Record<ClientStatus, { label: string; classes: string }> = {
  lead:     { label: 'Lead',     classes: 'bg-yellow-100 text-yellow-800' },
  active:   { label: 'Attivo',   classes: 'bg-green-100 text-green-800' },
  archived: { label: 'Archiviato', classes: 'bg-gray-100 text-gray-600' },
}

function statusConfig(value: string) {
  return STATUS_CONFIG[value as ClientStatus]
}

const FILTER_TABS: { value: ClientStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'Tutti' },
  { value: 'lead',     label: 'Lead' },
  { value: 'active',   label: 'Attivi' },
  { value: 'archived', label: 'Archiviati' },
]

const filteredItems = computed(() =>
  activeFilter.value === 'all'
    ? items.value
    : items.value.filter((c) => c.status === activeFilter.value),
)

const columns: Column[] = [
  { key: 'name',      label: 'Nome' },
  { key: 'email',     label: 'Email' },
  { key: 'phone',     label: 'Telefono' },
  { key: 'vatNumber', label: 'P.IVA' },
  { key: 'city',      label: 'Città' },
  { key: 'status',    label: 'Stato' },
]

const fields: FieldDef[] = [
  { key: 'name',       label: 'Nome',           type: 'text',     required: true, placeholder: 'Es. Mario Rossi Srl' },
  { key: 'status',     label: 'Stato',           type: 'select',   required: true, col: 1,
    options: [
      { value: 'lead',     label: 'Lead' },
      { value: 'active',   label: 'Attivo' },
      { value: 'archived', label: 'Archiviato' },
    ],
  },

  { key: '_contatti',  label: 'Contatti',        type: 'divider' },
  { key: 'email',      label: 'Email',           type: 'email',    col: 1, placeholder: 'email@esempio.it' },
  { key: 'phone',      label: 'Telefono',        type: 'text',     col: 1, placeholder: '+39 333 1234567' },

  { key: '_fiscale',   label: 'Dati fiscali',    type: 'divider' },
  { key: 'vatNumber',  label: 'Partita IVA',     type: 'text',     col: 1, placeholder: 'IT12345678901' },
  { key: 'fiscalCode', label: 'Codice Fiscale',  type: 'text',     col: 1 },

  { key: '_indirizzo', label: 'Indirizzo',       type: 'divider' },
  { key: 'address',    label: 'Via / Indirizzo', type: 'text' },
  { key: 'city',       label: 'Città',           type: 'text',     col: 1 },
  { key: 'postalCode', label: 'CAP',             type: 'text',     col: 1 },
  { key: 'country',    label: 'Paese',           type: 'text',     placeholder: 'Italia' },

  { key: '_note',      label: 'Note',            type: 'divider' },
  { key: 'notes',      label: 'Note',            type: 'textarea' },
]

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/clients')
    items.value = res.data
  } catch {
    error.value = 'Errore nel caricamento dei clienti.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingItem.value = null
  modalOpen.value = true
}

function openEdit(item: Record<string, any>) {
  editingItem.value = item as Client
  modalOpen.value = true
}

async function handleSave(data: Record<string, any>) {
  saving.value = true
  error.value = null
  try {
    if (editingItem.value) {
      const { id, createdAt, updatedAt, ...payload } = data
      await api.put(`/clients/${editingItem.value.id}`, payload)
    } else {
      await api.post('/clients', data)
    }
    modalOpen.value = false
    await fetchItems()
  } catch {
    error.value = 'Errore nel salvataggio.'
  } finally {
    saving.value = false
  }
}

async function handleDelete(item: Record<string, any>) {
  const client = item as Client
  if (!confirm(`Eliminare il cliente "${client.name}"?`)) return
  try {
    await api.delete(`/clients/${client.id}`)
    await fetchItems()
  } catch {
    error.value = "Errore nell'eliminazione."
  }
}

onMounted(fetchItems)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clienti</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestisci i tuoi clienti</p>
      </div>
      <button @click="openCreate" class="btn btn-primary">
        + Nuovo cliente
      </button>
    </div>

    <div v-if="error" class="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Filtri per stato -->
    <div class="flex gap-1 mb-4">
      <button
        v-for="tab in FILTER_TABS"
        :key="tab.value"
        @click="activeFilter = tab.value"
        class="px-3 py-1.5 text-sm rounded-md font-medium transition-colors"
        :class="activeFilter === tab.value
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
      >
        {{ tab.label }}
        <span class="ml-1 text-xs opacity-70">
          {{ tab.value === 'all' ? items.length : items.filter(c => c.status === tab.value).length }}
        </span>
      </button>
    </div>

    <div class="card p-0 overflow-hidden">
      <CrudTable
        :columns="columns"
        :items="filteredItems"
        :loading="loading"
        empty-message="Nessun cliente trovato."
        @edit="openEdit"
        @delete="handleDelete"
      >
        <template #cell-status="{ value }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
            :class="statusConfig(value)?.classes"
          >
            {{ statusConfig(value)?.label ?? value }}
          </span>
        </template>
      </CrudTable>
    </div>

    <CrudModal
      :show="modalOpen"
      :title="editingItem ? 'Modifica cliente' : 'Nuovo cliente'"
      :fields="fields"
      :initial-data="editingItem ?? undefined"
      :loading="saving"
      @save="handleSave"
      @close="modalOpen = false"
    />
  </div>
</template>
