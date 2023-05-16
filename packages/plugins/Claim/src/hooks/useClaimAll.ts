import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { getClaimAllPools } from '../utils/index.js'
import type { SwappedTokenType } from '../types.js'
import type { FungibleToken } from '@masknet/web3-shared-base'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const { account } = useChainContext()
    const { pluginID } = useNetworkContext()
    const allPoolsRef = useRef<SwappedTokenType[]>([])

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const asyncResult = useAsyncRetry(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM || !account) return []
        if (allPoolsRef.current.length > 0 || !connection) return allPoolsRef.current
        const blockNumber = await connection.getBlockNumber()
        const results = await getClaimAllPools(chainId, blockNumber, swapperAddress, connection)
        const resultsWithToken = await Promise.all(
            results.map(async (x) => {
                const tokenDetailed = await connection.getFungibleToken(x.token.address)

                return {
                    ...x,
                    token: (tokenDetailed as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>) ?? x.token,
                }
            }),
        )
        allPoolsRef.current = resultsWithToken
        return allPoolsRef.current
    }, [swapperAddress, chainId, connection, pluginID, account])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = []
            asyncResult.retry()
        },
    }
}
