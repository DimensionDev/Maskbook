import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'
import type { NetworkPluginID } from '../web3-types'

export function useChainIdValid(pluginID?: NetworkPluginID) {
    const account = useAccount(pluginID)
    const chainId = useChainId(pluginID)
    const { Utils } = useWeb3State(pluginID)
    return !account || (Utils?.isChainIdValid?.(chainId, process.env.NODE_ENV === 'development') ?? false)
}
