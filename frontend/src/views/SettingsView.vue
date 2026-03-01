<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Coefficienti per tipo di attività (regime forfettario)
const activityTypes = [
  { label: 'Professionisti e consulenti (es. dev, designer, consulenti)', coefficient: 78 },
  { label: 'Agenti e rappresentanti di commercio', coefficient: 62 },
  { label: 'Artigiani e altre attività produttive', coefficient: 67 },
  { label: 'Commercio al dettaglio e attività assimilate', coefficient: 40 },
  { label: 'Commercio ambulante di alimentari e bevande', coefficient: 40 },
  { label: 'Servizi di alloggio e ristorazione', coefficient: 40 },
  { label: 'Attività immobiliari', coefficient: 86 },
  { label: 'Altro (inserisci manuale)', coefficient: null },
]

const saveSuccess = ref(false)
const saveError = ref(false)
const loading = ref(false)

const form = reactive({
  firstName: authStore.user?.firstName ?? '',
  lastName: authStore.user?.lastName ?? '',
  email: authStore.user?.email ?? '',
  vatNumber: authStore.user?.vatNumber ?? '',
  fiscalCode: authStore.user?.fiscalCode ?? '',
  taxRateSubstitutive: authStore.user?.taxRateSubstitutive ?? 15,
  taxCoefficientIncome: authStore.user?.taxCoefficientIncome ?? 78,
  inpsManagement: authStore.user?.inpsManagement ?? 'gestione_separata',
})

// Quando cambia l'utente nello store (dopo fetchProfile), aggiorna il form
watch(() => authStore.user, (u) => {
  if (!u) return
  form.firstName = u.firstName
  form.lastName = u.lastName
  form.email = u.email
  form.vatNumber = u.vatNumber ?? ''
  form.fiscalCode = u.fiscalCode ?? ''
  form.taxRateSubstitutive = u.taxRateSubstitutive
  form.taxCoefficientIncome = u.taxCoefficientIncome
  form.inpsManagement = u.inpsManagement
})

function onActivityTypeChange(event: Event) {
  const selected = (event.target as HTMLSelectElement).value
  const found = activityTypes.find(a => a.label === selected)
  if (found?.coefficient !== null && found?.coefficient !== undefined) {
    form.taxCoefficientIncome = found.coefficient
  }
}

async function save() {
  loading.value = true
  saveSuccess.value = false
  saveError.value = false

  const ok = await authStore.updateProfile({
    firstName: form.firstName,
    lastName: form.lastName,
    vatNumber: form.vatNumber || undefined,
    fiscalCode: form.fiscalCode || undefined,
    taxRateSubstitutive: Number(form.taxRateSubstitutive),
    taxCoefficientIncome: Number(form.taxCoefficientIncome),
    inpsManagement: form.inpsManagement as 'gestione_separata' | 'cassa_professionale' | 'artigiani_commercianti',
  })

  loading.value = false
  if (ok) {
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } else {
    saveError.value = true
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Impostazioni</h1>

    <form @submit.prevent="save" class="space-y-8">

      <!-- Dati personali -->
      <section class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-5">Dati personali</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input v-model="form.firstName" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
            <input v-model="form.lastName" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" disabled
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p class="mt-1 text-xs text-gray-400">L'email non può essere modificata</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Partita IVA</label>
            <input v-model="form.vatNumber" type="text" maxlength="11"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Codice Fiscale</label>
            <input v-model="form.fiscalCode" type="text" maxlength="16"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>
      </section>

      <!-- Configurazione fiscale -->
      <section class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-1">Configurazione fiscale</h2>
        <p class="text-sm text-gray-500 mb-5">Regime forfettario — questi valori vengono usati per il calcolo delle tasse.</p>

        <div class="space-y-4">

          <!-- Tipo attività -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo di attività</label>
            <select @change="onActivityTypeChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="" disabled selected>Seleziona per impostare il coefficiente automaticamente</option>
              <option v-for="a in activityTypes" :key="a.label" :value="a.label">
                {{ a.label }}{{ a.coefficient !== null ? ` — ${a.coefficient}%` : '' }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-400">La selezione aggiorna automaticamente il coefficiente di redditività</p>
          </div>

          <!-- Coefficiente redditività -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Coefficiente di redditività
              <span class="ml-1 font-normal text-gray-400 text-xs">(% del fatturato su cui calcolare le tasse)</span>
            </label>
            <div class="flex items-center gap-2">
              <input v-model.number="form.taxCoefficientIncome" type="number" min="1" max="100" step="0.01" required
                class="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
              <span class="text-sm text-gray-500">%</span>
            </div>
          </div>

          <!-- Aliquota imposta sostitutiva -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Aliquota imposta sostitutiva</label>
            <div class="flex gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model.number="form.taxRateSubstitutive" :value="15"
                  class="text-primary-600 focus:ring-primary-500" />
                <span class="text-sm text-gray-700">15% <span class="text-gray-400">(ordinaria)</span></span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model.number="form.taxRateSubstitutive" :value="5"
                  class="text-primary-600 focus:ring-primary-500" />
                <span class="text-sm text-gray-700">5% <span class="text-gray-400">(startup — primi 5 anni)</span></span>
              </label>
            </div>
          </div>

          <!-- Gestione previdenziale -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gestione previdenziale</label>
            <select v-model="form.inpsManagement"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="gestione_separata">Gestione Separata INPS (~26%)</option>
              <option value="cassa_professionale">Cassa professionale (avvocati, commercialisti, ecc.)</option>
              <option value="artigiani_commercianti">Artigiani e commercianti INPS</option>
            </select>
            <p class="mt-1 text-xs text-gray-400">Usata per stimare i contributi deducibili nel calcolo delle tasse</p>
          </div>

        </div>
      </section>

      <!-- Azioni -->
      <div class="flex items-center gap-4">
        <button type="submit" :disabled="loading"
          class="btn btn-primary px-6">
          {{ loading ? 'Salvataggio...' : 'Salva modifiche' }}
        </button>
        <transition name="fade">
          <span v-if="saveSuccess" class="text-sm text-green-600 font-medium">Modifiche salvate</span>
          <span v-else-if="saveError" class="text-sm text-red-600 font-medium">Errore durante il salvataggio</span>
        </transition>
      </div>

    </form>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
