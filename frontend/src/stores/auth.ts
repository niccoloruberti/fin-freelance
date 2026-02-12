import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User, LoginCredentials, RegisterData } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      token.value = response.data.access_token
      user.value = response.data.user
      localStorage.setItem('token', response.data.access_token)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  async function register(data: RegisterData) {
    try {
      const response = await api.post('/auth/register', data)
      token.value = response.data.access_token
      user.value = response.data.user
      localStorage.setItem('token', response.data.access_token)
      return true
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  async function fetchProfile() {
    try {
      const response = await api.get('/auth/profile')
      user.value = response.data
    } catch (error) {
      console.error('Fetch profile error:', error)
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // Initialize
  if (token.value) {
    fetchProfile()
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    fetchProfile,
    logout
  }
})
