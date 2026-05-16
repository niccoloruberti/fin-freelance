<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import CrudModal, { type FieldDef } from '@/components/crud/CrudModal.vue'
import api from '@/services/api'
import type { Client, ClientStatus, ClientLookup } from '@/types'

const items = ref<Client[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<Client | null>(null)
const error = ref<string | null>(null)
const activeFilter = ref<ClientStatus | 'all'>('all')

// Lookup: fonti e servizi
const sources = ref<ClientLookup[]>([])
const services = ref<ClientLookup[]>([])
const showLookupPanel = ref(false)
const newSourceName = ref('')
const newServiceName = ref('')
const lookupError = ref<string | null>(null)

async function fetchLookups() {
  const [s, sv] = await Promise.all([
    api.get('/client-lookups?type=source'),
    api.get('/client-lookups?type=service'),
  ])
  sources.value = s.data
  services.value = sv.data
}

async function addLookup(type: 'source' | 'service') {
  const name = type === 'source' ? newSourceName.value.trim() : newServiceName.value.trim()
  if (!name) return
  lookupError.value = null
  try {
    await api.post('/client-lookups', { name, type })
    await fetchLookups()
    if (type === 'source') newSourceName.value = ''
    else newServiceName.value = ''
  } catch {
    lookupError.value = 'Errore nel salvataggio.'
  }
}

async function removeLookup(id: string) {
  lookupError.value = null
  try {
    await api.delete(`/client-lookups/${id}`)
    await fetchLookups()
  } catch {
    lookupError.value = "Errore nell'eliminazione."
  }
}

const STATUS_CONFIG: Record<ClientStatus, { label: string; classes: string }> = {
  lead:         { label: 'Lead',         classes: 'bg-yellow-100 text-yellow-800' },
  active:       { label: 'Attivo',       classes: 'bg-green-100 text-green-800' },
  attesa:       { label: 'In attesa',    classes: 'bg-blue-100 text-blue-800' },
  prenotazione: { label: 'Prenotazione', classes: 'bg-purple-100 text-purple-800' },
  finalizzato:  { label: 'Finalizzato',  classes: 'bg-teal-100 text-teal-800' },
  perso:        { label: 'Perso',        classes: 'bg-red-100 text-red-800' },
  archived:     { label: 'Archiviato',   classes: 'bg-gray-100 text-gray-600' },
}

function statusConfig(value: string) {
  return STATUS_CONFIG[value as ClientStatus]
}

const FILTER_TABS: { value: ClientStatus | 'all'; label: string }[] = [
  { value: 'all',          label: 'Tutti' },
  { value: 'lead',         label: 'Lead' },
  { value: 'active',       label: 'Attivi' },
  { value: 'attesa',       label: 'In attesa' },
  { value: 'prenotazione', label: 'Prenotazione' },
  { value: 'finalizzato',  label: 'Finalizzati' },
  { value: 'perso',        label: 'Persi' },
  { value: 'archived',     label: 'Archiviati' },
]

const filteredItems = computed(() =>
  activeFilter.value === 'all'
    ? items.value
    : items.value.filter((c) => c.status === activeFilter.value),
)

const columns: Column[] = [
  { key: 'name',         label: 'Nome' },
  { key: 'email',        label: 'Email' },
  { key: 'phone',        label: 'Telefono' },
  { key: 'city',         label: 'Città' },
  { key: 'contactDate',  label: 'Data contatto' },
  { key: 'status',       label: 'Stato' },
]

const fields = computed<FieldDef[]>(() => [
  { key: 'name',       label: 'Nome',           type: 'text',   required: true, placeholder: 'Es. Mario Rossi Srl' },
  { key: 'status',     label: 'Stato',          type: 'select', required: true, col: 1,
    options: [
      { value: 'lead',         label: 'Lead' },
      { value: 'active',       label: 'Attivo' },
      { value: 'attesa',       label: 'In attesa' },
      { value: 'prenotazione', label: 'Prenotazione' },
      { value: 'finalizzato',  label: 'Finalizzato' },
      { value: 'perso',        label: 'Perso' },
      { value: 'archived',     label: 'Archiviato' },
    ],
  },
  { key: 'source',  label: 'Fonte',    type: 'select', col: 1,
    options: sources.value.map(s => ({ value: s.name, label: s.name })),
  },
  { key: 'service', label: 'Servizio', type: 'select', col: 1,
    options: services.value.map(s => ({ value: s.name, label: s.name })),
  },

  { key: '_contatti',       label: 'Contatti',        type: 'divider' },
  { key: 'email',           label: 'Email',           type: 'email', col: 1, placeholder: 'email@esempio.it' },
  { key: 'phone',           label: 'Telefono',        type: 'text',  col: 1, placeholder: '+39 333 1234567' },
  { key: 'birthDate',       label: 'Data di nascita', type: 'date',  col: 1 },
  { key: 'contactDate',     label: 'Data contatto',   type: 'date',  col: 1 },
  { key: 'lastContactDate', label: 'Ultimo contatto', type: 'date',  col: 1 },

  { key: '_fiscale',  label: 'Dati fiscali',    type: 'divider' },
  { key: 'fiscalCode', label: 'Codice Fiscale', type: 'text' },

  { key: '_indirizzo', label: 'Indirizzo',       type: 'divider' },
  { key: 'address',    label: 'Via / Indirizzo', type: 'text' },
  { key: 'city',       label: 'Città',           type: 'text', col: 1 },
  { key: 'postalCode', label: 'CAP',             type: 'text', col: 1 },
  { key: 'country',    label: 'Paese',           type: 'text', placeholder: 'Italia' },

  { key: '_note', label: 'Note', type: 'divider' },
  { key: 'notes', label: 'Note', type: 'textarea' },
])

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

onMounted(() => { fetchItems(); fetchLookups() })
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

    <!-- Pannello gestione fonti & servizi -->
    <div class="mb-4">
      <button
        @click="showLookupPanel = !showLookupPanel"
        class="text-sm text-primary-600 hover:text-primary-800 font-medium"
      >
        {{ showLookupPanel ? '▲' : '▼' }} Gestisci fonti &amp; servizi
      </button>

      <div v-if="showLookupPanel" class="mt-3 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div v-if="lookupError" class="col-span-2 text-sm text-red-600">{{ lookupError }}</div>

        <!-- Fonti -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fonti</p>
          <div class="flex flex-wrap gap-1 mb-2 min-h-[24px]">
            <span
              v-for="s in sources" :key="s.id"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white border border-gray-300 text-gray-700"
            >
              {{ s.name }}
              <button @click="removeLookup(s.id)" class="text-gray-400 hover:text-red-500 leading-none">&times;</button>
            </span>
            <span v-if="!sources.length" class="text-xs text-gray-400 italic">Nessuna fonte</span>
          </div>
          <div class="flex gap-1">
            <input
              v-model="newSourceName"
              @keyup.enter="addLookup('source')"
              type="text"
              placeholder="Nuova fonte..."
              class="input text-sm flex-1"
            />
            <button @click="addLookup('source')" class="btn btn-primary text-sm px-3">+</button>
          </div>
        </div>

        <!-- Servizi -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Servizi</p>
          <div class="flex flex-wrap gap-1 mb-2 min-h-[24px]">
            <span
              v-for="s in services" :key="s.id"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-white border border-gray-300 text-gray-700"
            >
              {{ s.name }}
              <button @click="removeLookup(s.id)" class="text-gray-400 hover:text-red-500 leading-none">&times;</button>
            </span>
            <span v-if="!services.length" class="text-xs text-gray-400 italic">Nessun servizio</span>
          </div>
          <div class="flex gap-1">
            <input
              v-model="newServiceName"
              @keyup.enter="addLookup('service')"
              type="text"
              placeholder="Nuovo servizio..."
              class="input text-sm flex-1"
            />
            <button @click="addLookup('service')" class="btn btn-primary text-sm px-3">+</button>
          </div>
        </div>
      </div>
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
