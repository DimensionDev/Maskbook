import { useMemo } from 'react'
import { OpenSeaPort } from 'opensea-js'
import { useWeb3Provider } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { isOpenSeaSupportedChainId, resolveOpenSeaNetwork } from '../../../pipes/index.js'

export function useOpenSea(pluginID?: NetworkPluginID, chainId?: Web3Helper.ChainIdAll) {
    const web3Provider = useWeb3Provider(pluginID)

    return useMemo(() => {
        if (!web3Provider) return
        if (pluginID !== NetworkPluginID.PLUGIN_EVM) return
        if (!chainId || !isOpenSeaSupportedChainId(chainId)) return
        return new OpenSeaPort(
            web3Provider,
            {
                apiBaseUrl: 'https://opensea-proxy.r2d2.to',
                networkName: resolveOpenSeaNetwork(chainId),
            },
            console.log,
        )
    }, [chainId, pluginID, web3Provider])
}
