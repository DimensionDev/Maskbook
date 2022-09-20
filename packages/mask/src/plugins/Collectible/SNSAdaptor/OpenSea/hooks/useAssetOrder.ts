import { useAsyncRetry } from 'react-use'
import { head } from 'lodash-unified'
import type { Order } from 'opensea-js/lib/types'
import { useChainId } from '@masknet/plugin-infra/web3'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { NetworkPluginID, ZERO } from '@masknet/web3-shared-base'
import type { AssetOrder } from '../../../../../../../web3-providers/src/opensea/types.js'
import { isOpenSeaSupportedChainId } from '../../../pipes/index.js'
import { useOpenSea } from './useOpenSea.js'

export function useAssetOrder(address?: string, tokenId?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const opensea = useOpenSea(NetworkPluginID.PLUGIN_EVM, isOpenSeaSupportedChainId(chainId) ? chainId : undefined)

    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        const asset = await opensea?.api.getAsset({
            tokenAddress: address,
            tokenId,
        })
        const getPrice = (order: Order | AssetOrder) => {
            const _order = order as AssetOrder
            return (
                getOrderUnitPrice(_order.current_bounty, _order.payment_token_contract?.decimals, _order.quantity) ??
                ZERO
            )
        }

        const sellOrders = asset?.sellOrders ?? []
        return head(sellOrders.sort((a, b) => getPrice(a).toNumber() - getPrice(b).toNumber()))
    }, [address, tokenId, opensea])
}
