import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { OrderSide } from 'opensea-js/lib/types'
import type { CryptoartAIToken } from '../types'
import { toTokenIdentifier } from '../utils'
import { getOrders } from '../apis'

export function useOrders(token?: CryptoartAIToken, side = OrderSide.Buy) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!token) return []

        const tradeResponse = await getOrders(token.tokenId, side, chainId)

        return tradeResponse
    }, [chainId, toTokenIdentifier(token)])
}
