import { useAsyncRetry } from 'react-use'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { createERC20Token } from '../helpers'
import type { ERC20TokenDetailed, EtherToken, EtherTokenDetailed } from '../types'
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
        return data.map((x) =>
            createERC20Token(chainId, formatChecksumAddress(x.id), x.decimals, x.name, x.symbol),
        ) as ERC20TokenDetailed[]
    }, [chainId])
}
