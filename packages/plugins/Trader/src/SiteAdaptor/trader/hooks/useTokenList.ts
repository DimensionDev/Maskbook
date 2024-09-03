import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useTokenList(chainId: ChainId) {
    return useQuery({
        queryKey: ['okx-swap', 'token-list', chainId],
        queryFn: async () => OKX.getTokens(chainId),
    })
}
