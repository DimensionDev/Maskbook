import { useAsync } from 'react-use'
import { fetchTwitterLookup } from '../apis'
import { PluginIdeaMarketRPC } from '../messages'

import { Markets, UserIdeaTokenBalance } from '../types'

export function useFetchUserTokens(holder: string) {
    return useAsync(async () => {
        if (!holder) return
        const tokenBalances = await PluginIdeaMarketRPC.fetchUserTokensBalances(holder)

        const tokenBalancesWithTwitterData = await Promise.all(
            tokenBalances.map(async (balance: UserIdeaTokenBalance) => {
                if (balance.token.market.marketID !== Markets.Twitter) return balance

                const twitterLookup = await fetchTwitterLookup(balance.token)
                const newToken = { ...balance }
                newToken.token.twitter = twitterLookup

                return newToken
            }),
        )

        return tokenBalancesWithTwitterData
    }, [holder])
}
