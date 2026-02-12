<script setup lang="ts">
import { ref, watch } from 'vue'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select'
  required?: boolean
  options?: { value: string | number; label: string }[]
  placeholder?: string
}

const props = defineProps<{
  show: boolean
  title: string
  fields: FieldDef[]
  initialData?: Record<string, any>
  loading?: boolean
}>()

const emit = defineEmits<{
  save: [data: Record<string, any>]
  close: []
}>()

const form = ref<Record<string, any>>({})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.value = props.initialData ? { ...props.initialData } : {}
    }
  },
  { immediate: true }
)

function handleSubmit() {
  emit('save', { ...form.value })
}
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
            <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
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
          <form id="crud-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div v-for="field in fields" :key="field.key">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
              </label>

              <textarea
                v-if="field.type === 'textarea'"
                v-model="form[field.key]"
                :placeholder="field.placeholder"
                :required="field.required"
                rows="3"
                class="input resize-none"
              />

              <select
                v-else-if="field.type === 'select'"
                v-model="form[field.key]"
                :required="field.required"
                class="input"
              >
                <option value="" disabled>Seleziona...</option>
                <option
                  v-for="opt in field.options"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>

              <input
                v-else
                v-model="form[field.key]"
                :type="field.type"
                :placeholder="field.placeholder"
                :required="field.required"
                class="input"
              />
            </div>
          </form>

          <!-- Footer -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button type="button" @click="emit('close')" class="btn btn-secondary">
              Annulla
            </button>
            <button
              type="submit"
              form="crud-form"
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
