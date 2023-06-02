import { useRef, useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { getClaimAllPools } from '../utils/index.js'
import type { SwappedTokenType } from '../types.js'

export function useClaimAll(swapperAddress: string, chainId: ChainId) {
    const { account } = useChainContext()
    const { pluginID } = useNetworkContext()
    const allPoolsRef = useRef<SwappedTokenType[]>([])

    useEffect(() => {
        allPoolsRef.current = []
    }, [chainId])

    const asyncResult = useAsyncRetry(async () => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM || !account) return []
        if (allPoolsRef.current.length > 0) return allPoolsRef.current
        const blockNumber = await Web3.getBlockNumber({
            chainId,
        })
        const results = await getClaimAllPools(chainId, blockNumber, swapperAddress)
        const resultsWithToken = await Promise.all(
            results.map(async (x) => {
                const tokenDetailed = await Web3.getFungibleToken(x.token.address, {
                    chainId,
                })

                return {
                    ...x,
                    token: (tokenDetailed as FungibleToken<ChainId, SchemaType.ERC20 | SchemaType.Native>) ?? x.token,
                }
            }),
        )
        allPoolsRef.current = resultsWithToken
        return allPoolsRef.current
    }, [swapperAddress, chainId, pluginID, account])

    return {
        ...asyncResult,
        retry: () => {
            allPoolsRef.current = []
            asyncResult.retry()
        },
    }
}
