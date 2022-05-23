import { useMemo } from 'react'
import { OpenSeaPort } from 'opensea-js'
import { useWeb3 } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { OpenSeaAPI_Key } from '../constants'
import { resolveOpenSeaNetwork } from '../pipes'

export function useOpenSeaSDK(chainId?: ChainId.Mainnet | ChainId.Rinkeby) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

    return useMemo(() => {
        if (!chainId || !web3) return
        return new OpenSeaPort(
            web3,
            {
                apiKey: OpenSeaAPI_Key,
                networkName: resolveOpenSeaNetwork(chainId),
            },
            console.log,
        )
    }, [web3])
}
