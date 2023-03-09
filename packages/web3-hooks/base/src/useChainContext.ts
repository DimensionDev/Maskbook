import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from './useContext.js'

export function useCurrentAccount<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.account as string | undefined
}

export function useCurrentChainId<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.chainId
}

export function useCurrentProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.providerType
}

export function useCurrentNetworkType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.networkType
}
