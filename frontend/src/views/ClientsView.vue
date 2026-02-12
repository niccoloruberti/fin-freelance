<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import CrudModal, { type FieldDef } from '@/components/crud/CrudModal.vue'
import api from '@/services/api'
import type { Client } from '@/types'

const items = ref<Client[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<Client | null>(null)
const error = ref<string | null>(null)

const columns: Column[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefono' },
  { key: 'vatNumber', label: 'P.IVA' },
  { key: 'city', label: 'Città' },
]

const fields: FieldDef[] = [
  { key: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Es. Mario Rossi Srl' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@esempio.it' },
  { key: 'phone', label: 'Telefono', type: 'text', placeholder: '+39 333 1234567' },
  { key: 'vatNumber', label: 'Partita IVA', type: 'text', placeholder: 'IT12345678901' },
  { key: 'fiscalCode', label: 'Codice Fiscale', type: 'text' },
  { key: 'address', label: 'Indirizzo', type: 'text' },
  { key: 'city', label: 'Città', type: 'text' },
  { key: 'postalCode', label: 'CAP', type: 'text' },
  { key: 'country', label: 'Paese', type: 'text', placeholder: 'Italia' },
  { key: 'notes', label: 'Note', type: 'textarea' },
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
      await api.put(`/clients/${editingItem.value.id}`, data)
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

    <div class="card p-0 overflow-hidden">
      <CrudTable
        :columns="columns"
        :items="items"
        :loading="loading"
        empty-message="Nessun cliente ancora. Creane uno!"
        @edit="openEdit"
        @delete="handleDelete"
      />
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
