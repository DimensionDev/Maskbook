import { useQuery } from '@tanstack/react-query'
import { DeBankFungibleToken } from '../../../web3-providers/src/DeBank/index.js'

export function useUserTotalBalance(address: string | undefined) {
    return useQuery({
        queryKey: ['user-total-balance', address],
        queryFn: async () => {
            if (!address) return 0
            const res = await DeBankFungibleToken.getTotalBalance(address)
            return res.total_usd_value
        },
    })
}
