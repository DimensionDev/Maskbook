import { useQuery } from '@tanstack/react-query'
import { getWalletPortfolioTotalValue } from '@masknet/web3-providers'

export function useUserTotalBalance(address: string | undefined) {
    return useQuery({
        queryKey: ['wallet', 'portfolio-total', address],
        queryFn: async () => {
            if (!address) return 0
            return getWalletPortfolioTotalValue(address)
        },
    })
}
