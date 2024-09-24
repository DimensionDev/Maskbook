import { OKX } from '@masknet/web3-providers'
import type { GetQuotesOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { QUOTE_STALE_DURATION } from '../../constants.js'
import { isGreaterThan } from '@masknet/web3-shared-base'

export function useQuotes(options: Partial<GetQuotesOptions>, enabled = true) {
    const valid =
        options.chainId && options.fromTokenAddress && options.toTokenAddress && isGreaterThan(options.amount ?? 0, 0)
    return useQuery({
        enabled: !!valid && enabled,
        queryKey: ['okx-swap', 'get-quotes', options],
        queryFn: () => OKX.getQuotes(options as GetQuotesOptions),
        staleTime: QUOTE_STALE_DURATION,
    })
}
