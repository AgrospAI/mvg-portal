'use server'
import axios from 'axios'
import { toast } from 'react-toastify'

const BASE_URL: string = process.env.NEXT_PUBLIC_CONSENT_SERVER

export const CONSENTS_API = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

CONSENTS_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      console.error('No response from server')
    } else {
      console.error('Error setting up request:', error.message)
    }

    toast.error(error.response?.data?.message || 'Unexpected error occured')

    return Promise.reject(error)
  }
)
