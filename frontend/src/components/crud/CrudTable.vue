<script setup lang="ts">
export interface Column {
  key: string
  label: string
  format?: (value: any, row: any) => string
}

const props = defineProps<{
  columns: Column[]
  items: Record<string, any>[]
  loading?: boolean
  emptyMessage?: string
}>()

const emit = defineEmits<{
  edit: [item: Record<string, any>]
  delete: [item: Record<string, any>]
}>()

function getCellValue(item: Record<string, any>, col: Column): string {
  const val = item[col.key]
  if (col.format) return col.format(val, item)
  return val ?? '—'
}
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <svg class="animate-spin w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="items.length === 0" class="text-center py-12 text-gray-500 text-sm">
      {{ emptyMessage ?? 'Nessun elemento trovato.' }}
    </div>

    <!-- Table -->
    <table v-else class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {{ col.label }}
          </th>
          <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Azioni
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50 transition-colors">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-4 py-3 text-sm text-gray-700"
          >
            <slot :name="`cell-${col.key}`" :value="item[col.key]" :row="item">
              {{ getCellValue(item, col) }}
            </slot>
          </td>
          <td class="px-4 py-3 text-right">
            <div class="flex justify-end gap-2">
              <button
                @click="emit('edit', item)"
                class="text-xs px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Modifica
              </button>
              <button
                @click="emit('delete', item)"
                class="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                Elimina
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
