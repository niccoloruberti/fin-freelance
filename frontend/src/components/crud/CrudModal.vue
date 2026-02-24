<script setup lang="ts">
import { ref, watch } from 'vue'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'divider'
  col?: 1 | 2
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

function colClass(field: FieldDef) {
  return field.col === 1 ? 'col-span-1' : 'col-span-2'
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
        <div class="modal-panel relative bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
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
          <form id="crud-form" @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto px-6 py-4">
            <div class="grid grid-cols-2 gap-x-4 gap-y-4">
              <template v-for="field in fields">
                <!-- Divider / section header -->
                <div v-if="field.type === 'divider'" :key="`divider-${field.key}`" class="col-span-2 flex items-center gap-3 pt-1">
                  <span class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ field.label }}</span>
                  <div class="flex-1 h-px bg-gray-100" />
                </div>

                <!-- Regular fields -->
                <div v-else :key="field.key" :class="colClass(field)">
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
              </template>
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
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  opacity: 0;
  transform: translateY(8px);
}
</style>
