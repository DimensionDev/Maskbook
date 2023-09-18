import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client'

const persister = createSyncStoragePersister({
    storage: window.localStorage,
})
// We don't persist all queries but only those have the first key starts with '@@'
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
    persister,
    dehydrateOptions: {
        shouldDehydrateQuery: ({ queryKey }) => {
            if (typeof queryKey[0] !== 'string') return false
            return queryKey[0].startsWith('@@')
        },
    },
}
