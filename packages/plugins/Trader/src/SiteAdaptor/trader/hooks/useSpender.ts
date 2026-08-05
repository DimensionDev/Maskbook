import { getOKXTokenApproveAddress } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useTrade } from '../contexts/index.js'

export function useSpender() {
    const trade = useTrade()
    const chainId = trade.fromToken?.chainId as ChainId
    return {
        data: getOKXTokenApproveAddress(chainId),
        isLoading: false,
        isPending: false,
    } as const
}
