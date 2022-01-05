import { useAccount, useChainId } from '.'
import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useBalance(chainId?: number, account?: string, pluginID?: NetworkPluginID) {
    const defaultChainId = useChainId(pluginID)
    const defaultAccount = useAccount(pluginID)
    const { balanceOfChain } = usePluginWeb3StateContext(pluginID)
    return balanceOfChain?.[chainId ?? defaultChainId]?.[(account ?? defaultAccount).toLowerCase()] ?? '0'
}
