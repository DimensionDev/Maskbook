// Similar to https://github.com/TanStack/query/blob/fe87fc1f97130c30079671e0fbf0ed189a477536/packages/query-broadcast-client-experimental/src/index.ts
import { MaskMessages } from '@masknet/shared-base'
import type { QueryClient } from '@tanstack/react-query'

interface BroadcastQueryClientOptions {
    queryClient: QueryClient
}

/**
 * @deprecated
 * Broadcasting cache changes might decrease performance, freezes web page sometimes
 */
export function broadcastQueryClient({ queryClient }: BroadcastQueryClientOptions) {
    let transaction = false
    const tx = (cb: () => void) => {
        transaction = true
        cb()
        transaction = false
    }

    const queryCache = queryClient.getQueryCache()

    queryClient.getQueryCache().subscribe((queryEvent) => {
        if (transaction) {
            return
        }

        const {
            query: { queryHash, queryKey, state },
        } = queryEvent

        if (queryEvent.type === 'updated' && queryEvent.action.type === 'success') {
            MaskMessages.events.reactQuerySync.sendByBroadcast({
                type: 'updated',
                queryHash,
                queryKey,
                state,
            })
        }

        if (queryEvent.type === 'removed') {
            MaskMessages.events.reactQuerySync.sendByBroadcast({
                type: 'removed',
                queryHash,
                queryKey,
            })
        }
    })

    MaskMessages.events.reactQuerySync.on((action) => {
        if (!action?.type) {
            return
        }

        tx(() => {
            const { type, queryHash, queryKey, state } = action

            if (type === 'updated') {
                const query = queryCache.get(queryHash)

                if (query) {
                    query.setState(state)
                    return
                }

                queryCache.build(
                    queryClient,
                    {
                        queryKey,
                        queryHash,
                    },
                    state,
                )
            } else if (type === 'removed') {
                const query = queryCache.get(queryHash)

                if (query) {
                    queryCache.remove(query)
                }
            }
        })
    })
}
