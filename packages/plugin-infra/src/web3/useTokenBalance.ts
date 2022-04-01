import { useAsyncRetry } from 'react-use'
import { useAccount } from '.'
import { NetworkPluginID, useWeb3State, Web3Plugin } from '..'
import FungibleToken = Web3Plugin.FungibleToken

export function useTokenBalance(token?: FungibleToken, expectedAccount?: string, pluginID?: NetworkPluginID) {
    const { Utils } = useWeb3State()
    const defaultAccount = useAccount(pluginID)

    const account = expectedAccount ?? defaultAccount

    return useAsyncRetry(async () => {
        if (!token) return
        return Utils?.getLatestTokenBalance?.(token, account) ?? '0'
    }, [account, Utils, token?.address, token?.chainId])
}
