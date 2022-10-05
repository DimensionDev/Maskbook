import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { OrderSide } from 'opensea-js/lib/types'
import type { Token } from '../types/index.js'
import { toTokenIdentifier } from '../utils.js'
import { getOrders } from '../apis/index.js'

export function useOrders(token?: Token, side = OrderSide.Buy) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    return useAsyncRetry(async () => {
        if (!token) return

        const tradeResponse = await getOrders(token.tokenId, side, chainId)

        return {
            trade: tradeResponse.trade,
            history: tradeResponse.history,
        }
    }, [chainId, toTokenIdentifier(token)])
}
