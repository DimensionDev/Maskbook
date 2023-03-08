import { fetchJSON } from '../entry-helpers.js'

export async function fetchFromSimpleHash<T>(url: string, path: string, init?: RequestInit) {
    return fetchJSON<T>(`${url}${path}`, {
        method: 'GET',
        mode: 'cors',
        headers: { 'content-type': 'application/json' },
    })
}
