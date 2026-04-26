<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
import CrudTable, { type Column } from '@/components/crud/CrudTable.vue'
import api from '@/services/api'
import type { RecurringTransaction, Category, Client } from '@/types'

const items = ref<RecurringTransaction[]>([])
const categories = ref<Category[]>([])
const clients = ref<Client[]>([])
const loading = ref(false)
const saving = ref(false)
const modalOpen = ref(false)
const editingItem = ref<RecurringTransaction | null>(null)
const error = ref<string | null>(null)

const frequencyLabels: Record<string, string> = {
  daily: 'Giornaliero',
  weekly: 'Settimanale',
  monthly: 'Mensile',
  yearly: 'Annuale',
}

const columns: Column[] = [
  {
    key: 'type',
    label: 'Tipo',
    format: (val: string) => val === 'income' ? 'Entrata' : 'Uscita',
  },
  { key: 'description', label: 'Descrizione' },
  {
    key: 'amount',
    label: 'Importo',
    format: (val: any, row: any) => {
      const sign = row.type === 'income' ? '+' : '-'
      return `${sign} ${Number(val).toFixed(2)} €`
    },
  },
  {
    key: 'frequency',
    label: 'Frequenza',
    format: (val: string) => frequencyLabels[val] ?? val,
  },
  {
    key: 'startDate',
    label: 'Dal',
    format: (val: string) => new Date(val).toLocaleDateString('it-IT'),
  },
  {
    key: 'endDate',
    label: 'Al',
    format: (val: string) => val ? new Date(val).toLocaleDateString('it-IT') : '—',
  },
  {
    key: 'category',
    label: 'Categoria',
    format: (_val: any, row: any) => row.category?.name ?? '—',
  },
]

// --- Form state ---
const form = ref({
  type: 'expense' as 'income' | 'expense',
  amount: null as number | null,
  description: '',
  frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  dayOfPeriod: null as number | null,
  startDate: '',
  endDate: '',
  active: true,
  categoryId: '',
  clientId: '',
})

// Category combobox
const categoryQuery = ref('')
const filteredCategories = computed(() => {
  const byType = categories.value.filter(c => c.type === form.value.type || c.type === 'both')
  if (!categoryQuery.value) return byType
  const q = categoryQuery.value.toLowerCase()
  return byType.filter(c => c.name.toLowerCase().includes(q))
})
const selectedCategory = computed({
  get: () => categories.value.find(c => c.id === form.value.categoryId) ?? null,
  set: (cat: Category | null) => { form.value.categoryId = cat?.id ?? '' },
})
function categoryDisplayValue(c: unknown) {
  return (c as Category | null)?.name ?? ''
}

// Client combobox
const clientQuery = ref('')
const filteredClients = computed(() => {
  if (!clientQuery.value) return clients.value
  const q = clientQuery.value.toLowerCase()
  return clients.value.filter(c => c.name.toLowerCase().includes(q))
})
const selectedClient = computed({
  get: () => clients.value.find(c => c.id === form.value.clientId) ?? null,
  set: (client: Client | null) => { form.value.clientId = client?.id ?? '' },
})
function clientDisplayValue(c: unknown) {
  return (c as Client | null)?.name ?? ''
}

// Reset category if type changes and current selection is incompatible
watch(() => form.value.type, () => {
  if (form.value.categoryId) {
    const still = categories.value.find(c => c.id === form.value.categoryId)
    if (still && still.type !== 'both' && still.type !== form.value.type) {
      form.value.categoryId = ''
    }
  }
})

function resetForm() {
  form.value = {
    type: 'expense',
    amount: null,
    description: '',
    frequency: 'monthly',
    dayOfPeriod: null,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    active: true,
    categoryId: '',
    clientId: '',
  }
  categoryQuery.value = ''
  clientQuery.value = ''
}

function openCreate() {
  editingItem.value = null
  resetForm()
  modalOpen.value = true
}

function openEdit(item: Record<string, any>) {
  editingItem.value = item as RecurringTransaction
  form.value = {
    type: item.type,
    amount: item.amount,
    description: item.description,
    frequency: item.frequency,
    dayOfPeriod: item.dayOfPeriod ?? null,
    startDate: item.startDate,
    endDate: item.endDate ?? '',
    active: item.active,
    categoryId: item.categoryId ?? '',
    clientId: item.clientId ?? '',
  }
  categoryQuery.value = ''
  clientQuery.value = ''
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  editingItem.value = null
}

async function handleSave() {
  saving.value = true
  error.value = null
  try {
    const payload: Record<string, any> = {
      type: form.value.type,
      amount: Number(form.value.amount),
      description: form.value.description,
      frequency: form.value.frequency,
      startDate: form.value.startDate,
      active: form.value.active,
    }
    if (form.value.dayOfPeriod) payload.dayOfPeriod = form.value.dayOfPeriod
    if (form.value.endDate) payload.endDate = form.value.endDate
    if (form.value.categoryId) payload.categoryId = form.value.categoryId
    if (form.value.clientId) payload.clientId = form.value.clientId

    if (editingItem.value) {
      await api.patch(`/recurring/${editingItem.value.id}`, payload)
    } else {
      await api.post('/recurring', payload)
    }
    closeModal()
    await fetchItems()
  } catch {
    error.value = 'Errore nel salvataggio.'
  } finally {
    saving.value = false
  }
}

async function toggleActive(item: RecurringTransaction) {
  try {
    await api.patch(`/recurring/${item.id}`, { active: !item.active })
    await fetchItems()
  } catch {
    error.value = 'Errore nel cambio stato.'
  }
}

async function handleDelete(item: Record<string, any>) {
  const rec = item as RecurringTransaction
  if (!confirm(`Eliminare il template ricorrente "${rec.description}"?\nLe transazioni già generate non verranno eliminate.`)) return
  try {
    await api.delete(`/recurring/${rec.id}`)
    await fetchItems()
  } catch {
    error.value = "Errore nell'eliminazione."
  }
}

async function fetchItems() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get('/recurring')
    items.value = res.data
  } catch {
    error.value = 'Errore nel caricamento.'
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await api.get('/categories')
    categories.value = res.data
  } catch {}
}

async function fetchClients() {
  try {
    const res = await api.get('/clients')
    clients.value = res.data
  } catch {}
}

onMounted(() => {
  fetchItems()
  fetchCategories()
  fetchClients()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ricorrenti</h1>
        <p class="text-sm text-gray-500 mt-0.5">Template per transazioni generate automaticamente ogni periodo</p>
      </div>
      <button @click="openCreate" class="btn btn-primary">
        + Nuovo template
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
        empty-message="Nessun template ricorrente. Creane uno per automatizzare le transazioni periodiche."
        @edit="openEdit"
        @delete="handleDelete"
      >
        <template #cell-type="{ value }">
          <span
            :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              value === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
            ]"
          >
            {{ value === 'income' ? '↑ Entrata' : '↓ Uscita' }}
          </span>
        </template>
        <template #cell-amount="{ value, row }">
          <span :class="row.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'">
            {{ row.type === 'income' ? '+' : '-' }} {{ Number(value).toFixed(2) }} €
          </span>
        </template>
        <!-- Append a "Stato" column with pause/resume button (not in columns def, custom slot not supported — handled via extra row action instead) -->
      </CrudTable>
    </div>

    <!-- Active status + pause outside CrudTable since CrudTable doesn't support extra action columns -->
    <div v-if="items.length > 0 && !loading" class="mt-4 space-y-2">
      <p class="text-xs text-gray-400 font-medium uppercase tracking-wider px-1">Stato template</p>
      <div class="card divide-y divide-gray-100 p-0 overflow-hidden">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between px-4 py-3"
        >
          <div class="flex items-center gap-3 min-w-0">
            <span
              :class="[
                'w-2 h-2 rounded-full flex-shrink-0',
                item.active ? 'bg-green-400' : 'bg-gray-300',
              ]"
            />
            <span class="text-sm font-medium text-gray-900 truncate">{{ item.description }}</span>
            <span class="text-xs text-gray-400">{{ frequencyLabels[item.frequency] }}</span>
          </div>
          <button
            @click="toggleActive(item)"
            :class="[
              'text-xs px-3 py-1 rounded-full font-medium transition-colors flex-shrink-0',
              item.active
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200',
            ]"
          >
            {{ item.active ? 'Metti in pausa' : 'Riattiva' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @mousedown.self="closeModal"
        >
          <div class="absolute inset-0 bg-black/40" />
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ editingItem ? 'Modifica template' : 'Nuovo template ricorrente' }}
              </h2>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <form id="recurring-form" @submit.prevent="handleSave" class="flex-1 overflow-y-auto px-6 py-4">
              <div class="grid grid-cols-2 gap-x-4 gap-y-4">

                <!-- Type toggle -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Tipo <span class="text-red-500">*</span></label>
                  <div class="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      @click="form.type = 'income'"
                      :class="[
                        'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border-2',
                        form.type === 'income'
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                      Entrata
                    </button>
                    <button
                      type="button"
                      @click="form.type = 'expense'"
                      :class="[
                        'flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all border-2',
                        form.type === 'expense'
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                      ]"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                      Uscita
                    </button>
                  </div>
                </div>

                <!-- Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Importo <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">EUR</span>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      class="input pl-12"
                    />
                  </div>
                </div>

                <!-- Frequency -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Frequenza <span class="text-red-500">*</span></label>
                  <select v-model="form.frequency" required class="input">
                    <option value="daily">Giornaliero</option>
                    <option value="weekly">Settimanale</option>
                    <option value="monthly">Mensile</option>
                    <option value="yearly">Annuale</option>
                  </select>
                </div>

                <!-- Description -->
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descrizione <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.description"
                    type="text"
                    required
                    placeholder="Es. Affitto studio"
                    class="input"
                  />
                </div>

                <!-- Start date + End date -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Data inizio <span class="text-red-500">*</span></label>
                  <input v-model="form.startDate" type="date" required class="input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Data fine <span class="text-gray-400 text-xs">(opzionale)</span></label>
                  <input v-model="form.endDate" type="date" class="input" />
                </div>

                <!-- Day of period (solo per monthly) -->
                <div v-if="form.frequency === 'monthly'" class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Giorno del mese <span class="text-gray-400 text-xs">(1–28, opzionale)</span></label>
                  <input
                    v-model.number="form.dayOfPeriod"
                    type="number"
                    min="1"
                    max="28"
                    placeholder="Es. 1 per il primo del mese"
                    class="input"
                  />
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <Combobox v-model="selectedCategory" nullable>
                    <div class="relative">
                      <ComboboxInput
                        class="input pr-8"
                        :displayValue="categoryDisplayValue"
                        placeholder="Cerca categoria..."
                        @change="categoryQuery = $event.target.value"
                      />
                      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </ComboboxButton>
                      <ComboboxOptions class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 text-sm">
                        <ComboboxOption :value="null" v-slot="{ active }">
                          <div :class="['px-3 py-2 cursor-pointer text-gray-500 italic', active ? 'bg-primary-50' : '']">
                            Nessuna categoria
                          </div>
                        </ComboboxOption>
                        <ComboboxOption v-for="cat in filteredCategories" :key="cat.id" :value="cat" v-slot="{ active, selected }">
                          <div :class="['px-3 py-2 cursor-pointer flex items-center justify-between', active ? 'bg-primary-50 text-primary-700' : 'text-gray-900']">
                            <span>{{ cat.icon }} {{ cat.name }}</span>
                            <svg v-if="selected" class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </ComboboxOption>
                        <div v-if="filteredCategories.length === 0" class="px-3 py-2 text-gray-400 italic">Nessun risultato</div>
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                <!-- Client -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <Combobox v-model="selectedClient" nullable>
                    <div class="relative">
                      <ComboboxInput
                        class="input pr-8"
                        :displayValue="clientDisplayValue"
                        placeholder="Cerca cliente..."
                        @change="clientQuery = $event.target.value"
                      />
                      <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </ComboboxButton>
                      <ComboboxOptions class="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 text-sm">
                        <ComboboxOption :value="null" v-slot="{ active }">
                          <div :class="['px-3 py-2 cursor-pointer text-gray-500 italic', active ? 'bg-primary-50' : '']">
                            Nessun cliente
                          </div>
                        </ComboboxOption>
                        <ComboboxOption v-for="client in filteredClients" :key="client.id" :value="client" v-slot="{ active, selected }">
                          <div :class="['px-3 py-2 cursor-pointer flex items-center justify-between', active ? 'bg-primary-50 text-primary-700' : 'text-gray-900']">
                            <span>{{ client.name }}</span>
                            <svg v-if="selected" class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </ComboboxOption>
                        <div v-if="filteredClients.length === 0" class="px-3 py-2 text-gray-400 italic">Nessun risultato</div>
                      </ComboboxOptions>
                    </div>
                  </Combobox>
                </div>

                <!-- Active toggle -->
                <div class="col-span-2 flex items-center gap-3">
                  <button
                    type="button"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                      form.active ? 'bg-primary-600' : 'bg-gray-200',
                    ]"
                    @click="form.active = !form.active"
                  >
                    <span
                      :class="[
                        'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                        form.active ? 'translate-x-5' : 'translate-x-0',
                      ]"
                    />
                  </button>
                  <span class="text-sm text-gray-700">Template attivo</span>
                </div>

              </div>
            </form>

            <!-- Footer -->
            <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <button type="button" @click="closeModal" class="btn btn-secondary">Annulla</button>
              <button type="submit" form="recurring-form" :disabled="saving" class="btn btn-primary disabled:opacity-60">
                <span v-if="saving">Salvataggio...</span>
                <span v-else>Salva</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
