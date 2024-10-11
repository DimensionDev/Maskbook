import { OKX } from '@masknet/web3-providers'
import type { GetQuotesOptions } from '@masknet/web3-providers/types'
import { isGreaterThan } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { QUOTE_STALE_DURATION, REFETCH_INTERVAL } from '../../constants.js'

export function useQuotes(options: Partial<GetQuotesOptions>, enabled = true) {
    const valid =
        options.chainId && options.fromTokenAddress && options.toTokenAddress && isGreaterThan(options.amount ?? 0, 0)
    return useQuery({
        enabled: !!valid && enabled,
        queryKey: ['okx-swap', 'get-quotes', options],
        queryFn: () => OKX.getQuotes(options as GetQuotesOptions),
        staleTime: QUOTE_STALE_DURATION,
        refetchInterval: REFETCH_INTERVAL,
    })
}
