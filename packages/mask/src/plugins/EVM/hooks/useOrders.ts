import { OrderSide } from '@masknet/web3-providers'
import { useChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { EVM_RPC } from '../messages'

export function useOrders(address?: string, tokenId?: string, side?: OrderSide) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        return EVM_RPC.getOrder(address, tokenId, side ?? OrderSide.Sell, chainId)
    }, [address, tokenId, side, chainId])
}
