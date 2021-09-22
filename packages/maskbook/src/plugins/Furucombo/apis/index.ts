import { API_URL, API_KEY } from '../constants'

export async function fetchPools() {
    const response = await fetch(API_URL, { headers: { 'x-api-key': API_KEY } })
    const data = await response.json()
    return data ?? []
}
