import { makeStyles } from '@masknet/theme'
import { NFTDescription } from '../../../../components/shared/NFTCard/NFTDescription'
import { NFTPropertiesCard } from '../../../../components/shared/NFTCard/NFTPropertiesCard'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'
import { NFTInfoCard } from '../../../../components/shared/NFTCard/NFTInfoCard'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID, NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        maxHeight: 'calc(100% - 72px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
    },
}))
const resolveTopOffer = (orders?: Array<NonFungibleTokenOrder<ChainId, SchemaType>>) => {
    if (!orders || !orders.length) return
    return first(
        orders.sort((a, b) => {
            const value_a = new BigNumber(a.priceInToken?.amount ?? 0)
            const value_b = new BigNumber(b.priceInToken?.amount ?? 0)
            return Number(value_a.lt(value_b))
        }),
    )
}
export interface AboutTabProps {
    asset: AsyncStateRetry<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
    orders: AsyncStateRetry<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>>
}

export function AboutTab(props: AboutTabProps) {
    const { asset, orders } = props
    const { classes } = useStyles()
    const _asset = asset.value
    const topOffer = resolveTopOffer(orders.value?.data)

    if (!_asset) return null
    return (
        <div className={classes.wrapper}>
            <NFTPriceCard topOffer={topOffer} asset={_asset} />
            <NFTInfoCard asset={_asset} />
            <NFTDescription asset={_asset} />
            <NFTPropertiesCard timeline asset={_asset} />
        </div>
    )
}
