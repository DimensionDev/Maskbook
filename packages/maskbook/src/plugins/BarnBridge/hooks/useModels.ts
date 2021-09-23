import { useAsyncRetry } from 'react-use'
import { SYGetPools, SYGetPortfolio } from '../apis'

export function useSYPoolData() {
    return useAsyncRetry(async () => {
        const data = await SYGetPools()
        return data
    }, [])
}

export function useSYPortfolioData(walletAddress: string) {
    return useAsyncRetry(async () => {
        const data = await SYGetPortfolio(walletAddress)
        return data
    }, [walletAddress])
}
