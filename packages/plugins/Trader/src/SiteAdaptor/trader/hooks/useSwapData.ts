import { OKX } from '@masknet/web3-providers'
import type { SwapOptions } from '@masknet/web3-providers/types'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useSwapData(opts: Partial<SwapOptions>) {
    const enabled =
        opts.chainId &&
        opts.amount &&
        opts.fromTokenAddress &&
        opts.toTokenAddress &&
        opts.slippage !== undefined &&
        opts.userWalletAddress &&
        (!opts.dexIds || opts.dexIds.length > 0)

    return useQuery({
        queryKey: ['okx-swap', 'get-swap', opts],
        queryFn: enabled ? async () => OKX.getSwap(opts as SwapOptions) : skipToken,
    })
}
