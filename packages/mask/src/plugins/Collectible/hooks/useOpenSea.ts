import { useMemo } from 'react'
import { OpenSeaPort } from 'opensea-js'
import { useWeb3Provider } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { OpenSeaAPI_Key } from '../constants'
import { isOpenSeaSupportedChainId, resolveOpenSeaNetwork } from '../pipes'

export function useOpenSea(chainId?: ChainId) {
    const web3Provider = useWeb3Provider(NetworkPluginID.PLUGIN_EVM)

    return useMemo(() => {
        if (!chainId || !isOpenSeaSupportedChainId(chainId) || !web3Provider) return
        return new OpenSeaPort(
            web3Provider,
            {
                apiBaseUrl: 'https://opensea-proxy.r2d2.to',
                apiKey: OpenSeaAPI_Key,
                networkName: resolveOpenSeaNetwork(chainId),
            },
            console.log,
        )
    }, [web3Provider])
}
