import { useAsyncRetry } from 'react-use'
import { PluginBarnBridgeRPC } from '../messages'

export function useSYPoolData() {
    return useAsyncRetry(async () => {
        const data = await PluginBarnBridgeRPC.SYGetPools()
        return data
    }, [])
}

export function useSYPortfolioData(walletAddress: string) {
    return useAsyncRetry(async () => {
        const data = await PluginBarnBridgeRPC.SYGetPortfolio(walletAddress)
        return data
    }, [walletAddress])
}
