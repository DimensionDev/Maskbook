import { useAsync } from 'react-use'
import { fetchTwitterLookup, fetchUserTokensBalances } from '../apis'
import type { UserIdeaTokenBalance } from '../types'

export function useFetchUserTokens(holder: string) {
    return useAsync(async () => {
        if (!holder) return
        const tokenBalances = await fetchUserTokensBalances(holder)

        const tokenBalancesWithTwitterData = await Promise.all(
            tokenBalances.map(async (balance: UserIdeaTokenBalance) => {
                if (balance.token.market.id !== '0x1') return balance

                const twitterLookup = await fetchTwitterLookup(balance.token)
                const newToken = { ...balance }
                newToken.token.twitter = twitterLookup

                return newToken
            }),
        )

        return tokenBalancesWithTwitterData
    }, [holder])
}
