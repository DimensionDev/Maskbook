import { useAsyncRetry } from 'react-use'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { createERC20Token } from '../helpers'
import { ChainId } from '../types'
import type { Debank } from './useAssetsDetailedDebank'
import { useChainId } from './useChainState'

async function fetcher(chainId: ChainId) {
    if (chainId !== ChainId.Mainnet) return []
    const response = await fetch('https://api.debank.com/stable_coins')
    const { data = [], error_code } = (await response.json()) as Debank.BalanceListResponse
    if (error_code === 0) return data
    return []
}

export function useStableTokensDebank() {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        const data = await fetcher(chainId)
        return data.map((x: { id: string; decimals: number; name: string; symbol: string }) =>
            createERC20Token(chainId, formatChecksumAddress(x.id), x.decimals, x.name, x.symbol),
        )
    }, [chainId])
}
