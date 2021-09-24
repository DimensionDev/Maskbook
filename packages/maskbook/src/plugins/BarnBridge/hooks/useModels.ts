import type { ChainId } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { SYGetPools, SYGetPortfolio } from '../apis'

export function useSYPoolData(chainId: ChainId) {
    return useAsyncRetry(async () => {
        const data = await SYGetPools(chainId)
        return data
    }, [chainId])
}

export function useSYPortfolioData(chainId: ChainId, walletAddress: string) {
    return useAsyncRetry(async () => {
        const data = await SYGetPortfolio(chainId, walletAddress)
        return data
    }, [chainId, walletAddress])
}
