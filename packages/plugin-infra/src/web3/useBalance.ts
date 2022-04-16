import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '../web3-types'

export function useBalance(pluginID?: NetworkPluginID, expectedChainId?: number, expectedAccount?: string) {
    const { Protocol } = useWeb3State()
    const defaultChainId = useChainId(pluginID)
    const defaultAccount = useAccount(pluginID)

    const chainId = expectedChainId ?? defaultChainId
    const account = expectedAccount ?? defaultAccount

    return useAsyncRetry(async () => {
        return Protocol?.getLatestBalance?.(chainId, account) ?? '0'
    }, [account, chainId, Protocol])
}
