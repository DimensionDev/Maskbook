import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'

export function useOKXTokenList(chainId: ChainId, enabled = true) {
    if (typeof chainId === 'string') {
        debugger
    }
    return useQuery({
        enabled,
        queryKey: ['okx-tokens', chainId],
        queryFn: () => OKX.getTokens(chainId),
    })
}
