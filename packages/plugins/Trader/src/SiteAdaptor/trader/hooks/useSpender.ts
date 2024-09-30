import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useTrade, type TradeMode } from '../contexts/index.js'

export function useSpender(expectedMode?: TradeMode) {
    const trade = useTrade()
    const chainId = trade.fromToken?.chainId as ChainId
    const mode = expectedMode || trade.mode
    return useQuery({
        queryKey: ['okx', 'supported-chains', mode],
        queryFn: async () => {
            if (mode === 'swap') return OKX.getSupportedChains()
            return OKX.getBridgeSupportedChains()
        },
        select(chains) {
            return chains?.find((x) => x.chainId === chainId)?.dexTokenApproveAddress
        },
    })
}
