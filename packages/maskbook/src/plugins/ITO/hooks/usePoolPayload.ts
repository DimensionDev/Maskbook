import { useAsyncRetry } from 'react-use'
import { PluginITO_RPC } from '../messages'

export function usePoolPayloadFromDB(id: string) {
    return useAsyncRetry(async () => {
        const record = await PluginITO_RPC.getPoolFromDB(id)
        return record?.payload
    }, [id])
}

export function usePoolPayloadFromSubgraph(id: string) {
    return useAsyncRetry(() => PluginITO_RPC.getPool(id), [id])
}

export function usePoolPayload(id: string) {
    return useAsyncRetry(async () => {
        const [payloadFromDB, payloadFromSubgraph] = await Promise.all([
            PluginITO_RPC.getPoolFromDB(id),
            PluginITO_RPC.getPool(id),
        ])
        // the pool creator keeps password in local DB
        if (payloadFromDB?.payload.password) payloadFromSubgraph.password = payloadFromDB?.payload.password
        return payloadFromSubgraph
    }, [id])
}
