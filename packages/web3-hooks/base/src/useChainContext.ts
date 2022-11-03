import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext } from './useContext.js'

export function useCurrentAccount<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.account as string | undefined
}

export function useCurrentChainId<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.chainId as Web3Helper.Definition[T]['ChainId'] | undefined
}

export function useCurrentProviderType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.providerType as Web3Helper.Definition[T]['ProviderType'] | undefined
}

export function useCurrentNetworkType<T extends NetworkPluginID>(pluginID?: T) {
    const web3 = useChainContext()
    return web3.networkType as Web3Helper.Definition[T]['NetworkType'] | undefined
}
