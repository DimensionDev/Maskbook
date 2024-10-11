import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { skipToken, useQuery } from '@tanstack/react-query'

export function useOKXTokenList(chainId: ChainId | undefined, enabled = true) {
    return useQuery({
        enabled,
        queryKey: ['okx-tokens', chainId],
        queryFn: chainId ? () => OKX.getTokens(chainId) : skipToken,
    })
}
