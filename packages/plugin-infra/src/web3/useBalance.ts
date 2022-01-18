import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId } from '.'
import { NetworkPluginID, useWeb3State } from '..'

export function useBalance(expectedChainId?: number, expectedAccount?: string, pluginID?: NetworkPluginID) {
    const { Provider } = useWeb3State()
    const defaultChainId = useChainId(pluginID)
    const defaultAccount = useAccount(pluginID)

    const chainId = expectedChainId ?? defaultChainId
    const account = expectedAccount ?? defaultAccount

    return useAsyncRetry(async () => {
        return Provider?.getLatestBalance(chainId, account) ?? '0'
    }, [account, chainId, Provider])
}
