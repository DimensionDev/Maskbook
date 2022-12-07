import { fetch, fetchCached, fetchSquashed, fetchR2D2 } from '@masknet/web3-providers/helpers'

export async function r2d2Fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return fetch(input, init, [fetchSquashed, fetchCached, fetchR2D2])
}

Reflect.set(globalThis, 'r2d2Fetch', r2d2Fetch)
Reflect.set(globalThis, 'fetch', r2d2Fetch)
