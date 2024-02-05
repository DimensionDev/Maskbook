import { type NetworkPluginID } from '@masknet/shared-base'
import type { ConnectionOptions } from '@masknet/web3-providers/types'
import { useQueries } from '@tanstack/react-query'
import { chunk } from 'lodash-es'
import { useWeb3Connection } from './useWeb3Connection.js'

export function useFungibleTokensBalance<T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    addresses?: string[],
    options?: ConnectionOptions<T>,
) {
    const Web3 = useWeb3Connection(pluginID, options)

    // Balance Checker we use behind `getFungibleTokensBalance` could fail for
    // some invalid ERC20 token, breaking into multiple chunks can reduce
    // failures. 100 is a trade-off between efficient and speed.
    const chunks = chunk(addresses, 100)
    const balances = useQueries({
        queries: chunks.map((addressChunk) => ({
            queryKey: ['fungible-token', 'balances', addressChunk],
            queryFn: () => Web3.getFungibleTokensBalance(addressChunk),
        })),
        combine(result) {
            return result.reduce((balances, query) => ({ ...balances, ...query.data }), {} as Record<string, string>)
        },
    })

    return balances
}
