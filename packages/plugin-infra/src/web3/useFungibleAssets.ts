import { useMemo } from 'react'
import { useWeb3State } from './useWeb3State'
import type { Web3Plugin, NetworkPluginID } from '../web3-types'
import { useIteratorCollector } from '@masknet/web3-shared-base'

export const useFungibleAssets = (account: string, chainId: number, pluginID?: NetworkPluginID) => {
    const { Asset } = useWeb3State(pluginID)
    const iterator = useMemo(() => Asset?.getAllFungibleAssets?.(chainId, account), [])

    const { data, status } = useIteratorCollector<Web3Plugin.FungibleAsset>(
        iterator,
        (x: Web3Plugin.FungibleAsset) => `${x.address}_${chainId}`,
    )

    // todo: add local token
    return {
        data,
        status,
    }
}
