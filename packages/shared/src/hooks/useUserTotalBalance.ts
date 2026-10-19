import { useQuery } from '@tanstack/react-query'
import { getWalletPortfolioTotalValue } from '../../../web3-providers/src/Firefly/Portfolio.js'

export function useUserTotalBalance(address: string | undefined) {
    return useQuery({
        queryKey: ['wallet', 'portfolio-total', address],
        queryFn: async () => {
            if (!address) return 0
            return getWalletPortfolioTotalValue(address)
        },
    })
}
