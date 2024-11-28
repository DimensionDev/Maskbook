import { OKX } from '@masknet/web3-providers'
import { type ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

interface Balance {
    /** ui amount */
    balance: string
    /** price in usd */
    tokenPrice: string
}

export function useUserTokenBalances(chainId: ChainId, account: string, enabled = true) {
    return useQuery({
        enabled,
        queryKey: ['token-balances', account, chainId],
        queryFn: async () => {
            const assets = await OKX.getUserTokenBalances(chainId, account)
            if (!assets.length) return null

            const map = new Map<string, Balance>()
            assets.forEach((asset) => {
                map.set(asset.tokenAddress.toLowerCase(), {
                    balance: asset.balance,
                    tokenPrice: asset.tokenPrice,
                })
            })
            return map
        },
    })
}
