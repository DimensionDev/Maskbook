import { OKX } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { useSwap } from '../contexts/TradeProvider.js'

export function useBridgeSpender() {
    const { mode, fromToken } = useSwap()
    const chainId = fromToken?.chainId as ChainId
    return useQuery({
        enabled: mode === 'bridge',
        queryKey: ['okx-bridge', 'supported-chains'],
        queryFn: async () => OKX.getBridgeSupportedChain(),
        select(res) {
            if (res.code !== 0) return undefined
            return res.data.find((x) => x.chainId === chainId)?.dexTokenApproveAddress
        },
    })
}
