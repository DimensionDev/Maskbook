import { useMemo } from 'react'
import { useWeb3State } from './useWeb3State'
import type { Web3Plugin, NetworkPluginID } from '../web3-types'
import { useIteratorCollector } from '@masknet/web3-shared-base'
import { useCounter } from 'react-use'

export const useNonFungibleAssets = (account: string, chainId: any, pluginID?: NetworkPluginID) => {
    const { Asset } = useWeb3State(pluginID)
    const [count, { inc }] = useCounter(0)
    const iterator = useMemo(() => Asset?.getAllNonFungibleAssets?.(chainId, account), [chainId, account, count])

    const { data, status } = useIteratorCollector<Web3Plugin.NonFungibleAsset>(
        iterator,
        (x: Web3Plugin.NonFungibleAsset) => `${x.tokenId}_${x.contract?.address}`,
    )

    return { data, status, retry: inc }
}
