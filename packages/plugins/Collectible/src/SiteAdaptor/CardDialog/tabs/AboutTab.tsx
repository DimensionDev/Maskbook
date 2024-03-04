import { memo } from 'react'
import { BigNumber } from 'bignumber.js'
import { first } from 'lodash-es'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { DescriptionCard } from '../../Shared/DescriptionCard.js'
import { PropertiesCard } from '../../Shared/PropertiesCard.js'
import { PriceCard } from '../../Shared/PriceCard.js'
import { DetailsCard } from '../../Shared/DetailsCard.js'
import { Context } from '../../Context/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        width: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
}))

const resolveTopListing = (orders?: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>) => {
    if (!orders?.length) return
    return first(
        orders.sort((a, b) => {
            const priceA = new BigNumber(a.price?.usd ?? 0)
            const priceB = new BigNumber(b.price?.usd ?? 0)
            return priceA.lt(priceB) ? 1 : 0
        }),
    )
}

interface AboutTabProps {
    asset: Web3Helper.NonFungibleAssetScope
    orders?: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>
}

export const AboutTab = memo(function AboutTab({ asset, orders }: AboutTabProps) {
    const { classes } = useStyles()

    const topListing = resolveTopListing(orders)
    const { rarity } = Context.useContainer()

    if (!asset) return null
    return (
        <div className={classes.root}>
            <PriceCard topListing={topListing} />
            <DetailsCard asset={asset} />
            <DescriptionCard asset={asset} />
            <PropertiesCard timeline asset={asset} rank={rarity.data?.rank} />
        </div>
    )
})
