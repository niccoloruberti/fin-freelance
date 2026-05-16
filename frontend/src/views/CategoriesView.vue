<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import CrudModal, { type FieldDef } from '@/components/crud/CrudModal.vue'
import api from '@/services/api'
import type { Category } from '@/types'

const items = ref<Category[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<Category | null>(null)
const error = ref<string | null>(null)

const searchQuery = ref('')
const filterType = ref<'all' | 'income' | 'expense' | 'both'>('all')

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tutti' },
  { value: 'income', label: 'Entrate' },
  { value: 'expense', label: 'Uscite' },
  { value: 'both', label: 'Entrambi' },
] as const

const filteredItems = computed(() => {
  return items.value.filter(cat => {
    if (filterType.value !== 'all' && cat.type !== filterType.value) return false
    if (searchQuery.value && !cat.name?.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    return true
  })
})

const columns: Column[] = [
  { key: 'name', label: 'Nome' },
  {
    key: 'type',
    label: 'Tipo',
    format: (val: string) => ({ income: 'Entrata', expense: 'Uscita', both: 'Entrambi' }[val] ?? val),
  },
  { key: 'icon', label: 'Icona' },
  { key: 'color', label: 'Colore' },
]

const EMOJI_LIST = [
  '💪', '🦴', '📋', '📚', '💻', '🏋️', '🏢', '📖', '🛠️', '🚗',
  '📣', '🛡️', '📦', '🎯', '🏃', '🧘', '⚡', '🌟', '💡', '🔧',
  '📊', '💰', '🤝', '🎓', '🏅', '🩺', '🧪', '🏆', '🎽', '🔬',
  '💊', '🥗', '🍎', '🧠', '⚖️', '🔑', '📱', '🎁', '🎨', '🚴',
]

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#6B7280',
]

const fields: FieldDef[] = [
  { key: 'name', label: 'Nome', type: 'text', required: true, placeholder: 'Es. Sessione PT' },
  {
    key: 'type',
    label: 'Tipo',
    type: 'select',
    required: true,
    options: [
      { value: 'income', label: 'Entrata' },
      { value: 'expense', label: 'Uscita' },
      { value: 'both', label: 'Entrambi' },
    ],
  },
  { key: 'icon', label: 'Icona', type: 'emoji', emojiList: EMOJI_LIST },
  { key: 'color', label: 'Colore', type: 'color', palette: COLOR_PALETTE },
]

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/categories')
    items.value = res.data
  } catch {
    error.value = 'Errore nel caricamento delle categorie.'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingItem.value = null
  modalOpen.value = true
}

function openEdit(item: Record<string, any>) {
  editingItem.value = item as Category
  modalOpen.value = true
}

async function handleSave(data: Record<string, any>) {
  saving.value = true
  error.value = null
  try {
    if (editingItem.value) {
      const { id, createdAt, updatedAt, ...payload } = data
      await api.put(`/categories/${editingItem.value.id}`, payload)
    } else {
      await api.post('/categories', data)
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
  const category = item as Category
  if (!confirm(`Eliminare la categoria "${category.name}"?`)) return
  try {
    await api.delete(`/categories/${category.id}`)
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
        <h1 class="text-2xl font-bold text-gray-900">Categorie</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestisci le categorie delle transazioni</p>
      </div>
      <button @click="openCreate" class="btn btn-primary">
        + Nuova categoria
      </button>
    </div>

    <div v-if="error" class="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Filtri -->
    <div class="mb-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
      <div class="relative flex-1 min-w-0">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Cerca..."
          class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div class="flex rounded-md bg-gray-100 p-0.5 gap-0.5 shrink-0">
        <button
          v-for="t in TYPE_OPTIONS"
          :key="t.value"
          @click="filterType = t.value"
          class="px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap"
          :class="filterType === t.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'"
        >{{ t.label }}</button>
      </div>
    </div>

    <div class="card p-0 overflow-hidden">
      <CrudTable
        :columns="columns"
        :items="filteredItems"
        :loading="loading"
        empty-message="Nessuna categoria ancora. Creane una!"
        @edit="openEdit"
        @delete="handleDelete"
      >
        <template #cell-icon="{ value }">
          <span class="text-xl">{{ value ?? '—' }}</span>
        </template>
        <template #cell-color="{ value }">
          <div v-if="value" class="flex items-center gap-2">
            <div :style="{ backgroundColor: value }" class="w-4 h-4 rounded-full flex-shrink-0" />
            <span class="text-xs text-gray-400 font-mono">{{ value }}</span>
          </div>
          <span v-else>—</span>
        </template>
      </CrudTable>
    </div>

    <CrudModal
      :show="modalOpen"
      :title="editingItem ? 'Modifica categoria' : 'Nuova categoria'"
      :fields="fields"
      :initial-data="editingItem ?? undefined"
      :loading="saving"
      @save="handleSave"
      @close="modalOpen = false"
    />
  </div>
</template>
