import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { OrderSide } from 'opensea-js/lib/types'
import type { Token } from '../types'
import { toTokenIdentifier } from '../utils'
import { getOrders } from '../apis'

export function useOrders(token?: Token, side = OrderSide.Buy) {
    const chainId = useChainId()
    return useAsyncRetry(async () => {
        if (!token) return

        const tradeResponse = await getOrders(token.tokenId, side, chainId)

        return {
            trade: tradeResponse.trade,
            history: tradeResponse.history,
        }
    }, [chainId, toTokenIdentifier(token)])
}
