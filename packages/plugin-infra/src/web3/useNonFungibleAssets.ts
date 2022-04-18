import { useMemo } from 'react'
import { useWeb3State } from './useWeb3State'
import type { Web3Plugin, NetworkPluginID } from '../web3-types'
import { useIteratorCollector } from '@masknet/web3-shared-base'

export const useNonFungibleAssets = (account: string, chainId: any, pluginID?: NetworkPluginID) => {
    const { Asset } = useWeb3State(pluginID)
    const iterator = useMemo(() => Asset?.getAllNonFungibleAssets?.(chainId, account), [])

    return useIteratorCollector<Web3Plugin.NonFungibleAsset>(
        iterator,
        (x: Web3Plugin.NonFungibleAsset) => `${x.tokenId}_${x.contract?.address}`,
    )
}
