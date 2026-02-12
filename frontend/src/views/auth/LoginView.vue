<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    })
    
    if (success) {
      router.push('/dashboard')
    } else {
      error.value = 'Credenziali non valide'
    }
  } catch (err) {
    error.value = 'Errore durante il login'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          FinFreelance
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Accedi al tuo account
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {{ error }}
        </div>
        
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="input mt-1"
              placeholder="tua@email.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="input mt-1"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full"
          >
            {{ loading ? 'Accesso in corso...' : 'Accedi' }}
          </button>
        </div>
        
        <div class="text-center">
          <router-link to="/register" class="text-primary-600 hover:text-primary-700">
            Non hai un account? Registrati
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>
