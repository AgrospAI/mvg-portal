import axios from 'axios'
import { toast } from 'react-toastify'

export const CONSENTS_API = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_CONSENT_SERVER}/api`,
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
