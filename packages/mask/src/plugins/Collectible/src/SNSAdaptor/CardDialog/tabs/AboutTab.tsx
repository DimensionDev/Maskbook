import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder, Pageable } from '@masknet/web3-shared-base'
import { DescriptionCard } from '../../Shared/DescriptionCard.js'
import { PropertiesCard } from '../../Shared/PropertiesCard.js'
import { PriceCard } from '../../Shared/PriceCard.js'
import { DetailsCard } from '../../Shared/DetailsCard.js'

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

const resolveTopOffer = (orders?: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>) => {
    if (!orders?.length) return
    return first(
        orders.sort((a, b) => {
            const priceA = new BigNumber(a.price?.usd ?? 0)
            const priceB = new BigNumber(b.price?.usd ?? 0)
            return priceA.lt(priceB) ? 1 : 0
        }),
    )
}

export interface AboutTabProps {
    asset: AsyncStateRetry<Web3Helper.NonFungibleAssetScope<void>>
    orders: AsyncStateRetry<Pageable<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>>
}

export function AboutTab(props: AboutTabProps) {
    const { asset, orders } = props
    const { classes } = useStyles()
    const _asset = asset.value
    const topOffer = resolveTopOffer(orders.value?.data)

    if (!_asset) return null
    return (
        <div className={classes.wrapper}>
            <PriceCard topOffer={topOffer} asset={_asset} />
            <DetailsCard asset={_asset} />
            <DescriptionCard asset={_asset} />
            <PropertiesCard timeline asset={_asset} />
        </div>
    )
}
