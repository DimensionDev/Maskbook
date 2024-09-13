import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useOKXTokenList(chainId: ChainId, enabled = true) {
    return useQuery({
        queryKey: ['okx-swap', 'token-list', chainId],
        queryFn: enabled ? async () => OKX.getTokens(chainId) : skipToken,
    })
}
