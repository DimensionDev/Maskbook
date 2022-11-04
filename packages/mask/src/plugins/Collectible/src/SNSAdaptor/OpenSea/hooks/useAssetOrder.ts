import { useAsyncRetry } from 'react-use'
import { head } from 'lodash-unified'
import type { Order } from 'opensea-js/lib/types.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { getOrderUnitPrice } from '@masknet/web3-providers'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useOpenSea } from './useOpenSea.js'
import { isOpenSeaSupportedChainId } from '../../../pipes/index.js'
import type { AssetOrder } from '../../../../../../../../web3-providers/src/opensea/types.js'

export function useAssetOrder(address?: string, tokenId?: string) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
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
