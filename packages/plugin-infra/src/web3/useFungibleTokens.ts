import type { NetworkPluginID } from '..'
import type { Web3Plugin } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useFungibleTokens<T extends Web3Plugin.FungibleToken[]>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).fungibleTokens as T
}
