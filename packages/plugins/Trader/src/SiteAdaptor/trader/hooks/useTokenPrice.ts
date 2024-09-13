import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useTokenPrice(chainId: ChainId | undefined, address: string | undefined) {
    const enabled = !!address && !!chainId
    return useQuery({
        enabled,
        queryKey: ['okx', 'token-price', address, chainId],
        queryFn: enabled ? () => OKX.getTokenPrice(address, chainId.toString()) : skipToken,
    })
}
