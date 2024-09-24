import { OKX } from '@masknet/web3-providers'
import type { BridgeOptions } from '@masknet/web3-providers/types'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useBridgeData(opts: Partial<BridgeOptions>) {
    const enabled =
        opts.fromChainId &&
        opts.toChainId &&
        opts.fromTokenAddress &&
        opts.toTokenAddress &&
        opts.amount &&
        opts.slippage !== undefined &&
        opts.userWalletAddress

    return useQuery({
        queryKey: ['okx', 'get-bridge', opts],
        queryFn: enabled ? async () => OKX.bridge(opts as BridgeOptions) : skipToken,
    })
}
