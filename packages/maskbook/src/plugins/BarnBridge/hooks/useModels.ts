import { useAsyncRetry } from 'react-use'
import { PluginBarnBridgeRPC } from '../messages'

export function useSYPoolData() {
    return useAsyncRetry(async () => {
        const data = await PluginBarnBridgeRPC.fuck()
        if (!data) return
        return data
    }, [])
}

export function useSYPortfolioData(walletAddress: string) {
    return useAsyncRetry(async () => {
        const data = await PluginBarnBridgeRPC.me(walletAddress)
        if (!data) return
        return data
    }, [walletAddress])
}
