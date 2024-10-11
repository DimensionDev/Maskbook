import { OKX } from '@masknet/web3-providers'
import type { GetBridgeQuoteOptions } from '@masknet/web3-providers/types'
import { useQuery } from '@tanstack/react-query'
import { QUOTE_STALE_DURATION, REFETCH_INTERVAL } from '../../constants.js'

export function useBridgeQuotes(options: Partial<GetBridgeQuoteOptions>, enabled = true) {
    const valid =
        options.fromChainId &&
        options.toChainId &&
        options.fromChainId !== options.toChainId &&
        options.amount &&
        options.amount !== '0' &&
        options.fromTokenAddress &&
        options.toTokenAddress &&
        options.slippage

    return useQuery({
        enabled: !!valid && enabled,
        queryKey: ['okx-bridge', 'get-quotes', options],
        queryFn: () => OKX.getBridgeQuote(options as GetBridgeQuoteOptions),
        staleTime: QUOTE_STALE_DURATION,
        refetchInterval: REFETCH_INTERVAL,
    })
}
