// https://github.com/TanStack/query/discussions/6446
import { Environment, isEnvironment } from '@dimensiondev/holoflows-kit'
import { simpleSerializer } from '@masknet/shared-base'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { PersistQueryClientOptions, PersistedClient } from '@tanstack/react-query-persist-client'
import { produce } from 'immer'

try {
    isEnvironment(Environment.ExtensionProtocol) &&
        // Leave it for a few releases (added in Nov 28 2023)
        localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE')
} catch {}

const cache = new Map<string, unknown>()
export function setInitData(key: string, value: unknown) {
    cache.set(key, value)
}
// https://github.com/TanStack/query/discussions/6447
const asyncStoragePersister = createAsyncStoragePersister({
    storage: {
        async getItem(k) {
            if (cache.has(k)) {
                const v = cache.get(k)
                cache.delete(k)
                return v
            }
            const v = await browser.storage.local.get(k)
            return v[k]
        },
        setItem(k, v) {
            return browser.storage.local.set({ [k]: v })
        },
        removeItem(key) {
            return browser.storage.local.remove(key)
        },
    },
    serialize: (data) => {
        const next = produce(data, (data) => {
            data.clientState.queries.forEach((query) => {
                for (const key in query.state) {
                    // we're doing the javascript-ish things
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    query.state[key] = simpleSerializer.serialization(query.state[key]) as any
                }
            })
        })
        return next as any
    },
    deserialize: (_data) => {
        const data = _data as unknown as PersistedClient
        data.clientState.queries.forEach((query) => {
            for (const key in query.state) {
                // we're doing the javascript-ish things
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                query.state[key] = simpleSerializer.deserialization(query.state[key]) as any
            }
        })
        return data
    },
    key: 'react-query',
    throttleTime: 1000,
})

// We don't persist all queries but only those have the first key starts with '@@'
export const queryPersistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
    persister: asyncStoragePersister,
    dehydrateOptions: {
        shouldDehydrateQuery: ({ queryKey }) => {
            if (typeof queryKey[0] !== 'string') return false
            return queryKey[0].startsWith('@@')
        },
    },
    buster: 'v1',
}
