import { OKX } from '@masknet/web3-providers'
import type { GetQuotesOptions } from '@masknet/web3-providers/types'
import { skipToken, useQuery } from '@tanstack/react-query'
import { QUOTE_STALE_DURATION } from '../../constants.js'

export function useQuotes(options: Partial<GetQuotesOptions>) {
    const enable = options.chainId && options.fromTokenAddress && options.toTokenAddress && options.amount
    return useQuery({
        queryKey: ['okx-swap', 'get-quotes', options],
        queryFn: enable ? () => OKX.getQuotes(options as GetQuotesOptions) : skipToken,
        staleTime: QUOTE_STALE_DURATION,
    })
}
