import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useSwap } from '../contexts/index.js'

export function useSwapSpender() {
    const { mode, fromToken } = useSwap()
    const chainId = fromToken?.chainId as ChainId
    return useQuery({
        enabled: mode === 'swap',
        queryKey: ['okx-swap', 'supported-chains'],
        queryFn: async () => OKX.getSupportedChains(),
        select(chains) {
            return chains?.find((x) => x.chainId === chainId)?.dexTokenApproveAddress
        },
    })
}
