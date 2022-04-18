import { useMemo } from 'react'
import { useWeb3State } from './useWeb3State'
import type { Web3Plugin, NetworkPluginID } from '../web3-types'
import { useIteratorCollector } from '@masknet/web3-shared-base'

export const useNonFungibleContracts = (account: string, chainId: any, pluginID?: NetworkPluginID) => {
    const { Asset } = useWeb3State(pluginID)
    const iterator = useMemo(() => Asset?.getAllNonFungibleContract?.(chainId, account), [])

    return useIteratorCollector<Web3Plugin.NonFungibleTokenContract>(
        iterator,
        (x: Web3Plugin.NonFungibleTokenContract) => `${x.address}_${x.chainId}`,
    )
}
