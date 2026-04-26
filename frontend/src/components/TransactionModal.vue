<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption } from '@headlessui/vue'
import type { Transaction, Category, Client } from '@/types'

const props = defineProps<{
  show: boolean
  initialData?: Transaction | null
  categories: Category[]
  clients: Client[]
  loading?: boolean
}>()

const emit = defineEmits<{
  save: [data: Record<string, any>]
  close: []
}>()

const form = ref({
  type: 'income' as 'income' | 'expense',
  amount: null as number | null,
  description: '',
  date: '',
  categoryId: '',
  clientId: '',
  invoiceNumber: '',
  isTaxable: true,
})

const filteredCategories = computed(() =>
  props.categories.filter(c => c.type === form.value.type || c.type === 'both')
)

// Client combobox
const clientQuery = ref('')
const selectedClient = computed({
  get: () => props.clients.find(c => c.id === form.value.clientId) ?? null,
  set: (client: Client | null) => { form.value.clientId = client?.id ?? '' },
})
function clientDisplayValue(c: unknown) {
  return (c as Client | null)?.name ?? ''
}

const filteredClients = computed(() => {
  if (!clientQuery.value) return props.clients
  const q = clientQuery.value.toLowerCase()
  return props.clients.filter(c => c.name.toLowerCase().includes(q))
})

// Category combobox
const categoryQuery = ref('')
const selectedCategory = computed({
  get: () => props.categories.find(c => c.id === form.value.categoryId) ?? null,
  set: (cat: Category | null) => { form.value.categoryId = cat?.id ?? '' },
})
function categoryDisplayValue(c: unknown) {
  return (c as Category | null)?.name ?? ''
}
const filteredCategoriesByQuery = computed(() => {
  const byType = filteredCategories.value
  if (!categoryQuery.value) return byType
  const q = categoryQuery.value.toLowerCase()
  return byType.filter(c => c.name.toLowerCase().includes(q))
})

watch(
  () => props.show,
  (val) => {
    if (!val) return
    if (props.initialData) {
      form.value = {
        type: props.initialData.type,
        amount: props.initialData.amount,
        description: props.initialData.description,
        date: props.initialData.date,
        categoryId: props.initialData.categoryId ?? '',
        clientId: props.initialData.clientId ?? '',
        invoiceNumber: props.initialData.invoiceNumber ?? '',
        isTaxable: props.initialData.isTaxable ?? true,
      }
    } else {
      form.value = {
        type: 'income',
        amount: null,
        description: '',
        date: new Date().toISOString().slice(0, 10),
        categoryId: '',
        clientId: '',
        invoiceNumber: '',
        isTaxable: true,
      }
    }
  },
  { immediate: true }
)

// Reset category when type changes and current selection is incompatible
watch(
  () => form.value.type,
  () => {
    if (form.value.categoryId) {
      const stillValid = filteredCategories.value.some(c => c.id === form.value.categoryId)
      if (!stillValid) {
        form.value.categoryId = ''
      }
    }
  }
)

function handleSubmit() {
  const data: Record<string, any> = {
    type: form.value.type,
    amount: Number(form.value.amount),
    description: form.value.description,
    date: form.value.date,
    isTaxable: form.value.isTaxable,
  }
  if (form.value.categoryId) data.categoryId = form.value.categoryId
  if (form.value.clientId) data.clientId = form.value.clientId
  if (form.value.invoiceNumber) data.invoiceNumber = form.value.invoiceNumber
  emit('save', data)
}

const isEditing = computed(() => !!props.initialData)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @mousedown.self="emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" />

        <!-- Panel -->
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Modifica transazione' : 'Nuova transazione' }}
            </h2>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form id="transaction-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-4">

              <!-- Type toggle (full width) -->
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
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
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
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    ]"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    Uscita
                  </button>
                </div>
              </div>

              <!-- Amount + Date (same row) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Importo <span class="text-red-500">*</span>
                </label>
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
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Data <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.date"
                  type="date"
                  required
                  class="input"
                />
              </div>

              <!-- Description (full width) -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.description"
                  type="text"
                  required
                  placeholder="Es. Consulenza progetto web"
                  class="input"
                />
              </div>

              <!-- Client + Category (same row) -->
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
                      <ComboboxOption
                        v-for="client in filteredClients"
                        :key="client.id"
                        :value="client"
                        v-slot="{ active, selected }"
                      >
                        <div :class="['px-3 py-2 cursor-pointer flex items-center justify-between', active ? 'bg-primary-50 text-primary-700' : 'text-gray-900']">
                          <span>{{ client.name }}</span>
                          <svg v-if="selected" class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </ComboboxOption>
                      <div v-if="filteredClients.length === 0" class="px-3 py-2 text-gray-400 italic">
                        Nessun risultato
                      </div>
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>
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
                      <ComboboxOption
                        v-for="cat in filteredCategoriesByQuery"
                        :key="cat.id"
                        :value="cat"
                        v-slot="{ active, selected }"
                      >
                        <div :class="['px-3 py-2 cursor-pointer flex items-center justify-between', active ? 'bg-primary-50 text-primary-700' : 'text-gray-900']">
                          <span>{{ cat.name }}</span>
                          <svg v-if="selected" class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </ComboboxOption>
                      <div v-if="filteredCategoriesByQuery.length === 0" class="px-3 py-2 text-gray-400 italic">
                        Nessun risultato
                      </div>
                    </ComboboxOptions>
                  </div>
                </Combobox>
              </div>

              <!-- Invoice number (full width) -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Numero fattura</label>
                <input
                  v-model="form.invoiceNumber"
                  type="text"
                  placeholder="Es. FT-2024-001"
                  class="input"
                />
              </div>

              <!-- isTaxable toggle (full width) -->
              <div class="col-span-2 flex items-center gap-3">
                <button
                  type="button"
                  :class="[
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                    form.isTaxable ? 'bg-primary-600' : 'bg-gray-200',
                  ]"
                  @click="form.isTaxable = !form.isTaxable"
                >
                  <span
                    :class="[
                      'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200',
                      form.isTaxable ? 'translate-x-5' : 'translate-x-0',
                    ]"
                  />
                </button>
                <span class="text-sm text-gray-700">Concorre al reddito imponibile</span>
              </div>

            </div>
          </form>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button type="button" @click="emit('close')" class="btn btn-secondary">
              Annulla
            </button>
            <button
              type="submit"
              form="transaction-form"
              :disabled="loading"
              class="btn btn-primary disabled:opacity-60"
            >
              <span v-if="loading">Salvataggio...</span>
              <span v-else>Salva</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
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
