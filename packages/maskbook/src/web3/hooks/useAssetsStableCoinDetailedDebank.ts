import { useAsyncRetry } from 'react-use'
import type { EtherToken, EtherTokenDetailed } from '../types'
import type { Debank } from './useAssetsDetailedDebank'
import { useChainId } from './useChainState'

async function fetcher() {
    const response = await fetch('https://api.debank.com/stable_coins')
    const { data = [], error_code } = (await response.json()) as Debank.BalanceListResponse
    if (error_code === 0) return data
    return []
}

export function useAssetsStableCoinDetailedDebank() {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        const data = await fetcher()
        return data.map((x) => ({
            address: x.id,
            chainId,
        })) as EtherToken[]
    }, [chainId])
}
