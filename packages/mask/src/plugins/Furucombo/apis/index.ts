import { API_KEY, API_URL } from '../constants.js'
import type { Investable } from '../types.js'

export interface InvestablesData {
    count: number
    investables: Investable[]
}

let cachedAt = Date.now()
let cachedResult: InvestablesData | undefined

export async function fetchPools() {
    if (cachedResult && Date.now() - cachedAt > 30 * 1000 /* cache for 30s */) return cachedResult

    const response = await fetch(API_URL, { headers: { 'x-api-key': API_KEY } })
    cachedResult = await response.json()
    cachedAt = Date.now()

    return cachedResult
}
