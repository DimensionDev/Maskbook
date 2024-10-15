import { BigNumber } from 'bignumber.js'
import { first } from 'lodash-es'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { CollectibleCard } from '../CollectibleCard.js'
import { FigureCard } from '../../Shared/FigureCard.js'
import { PriceCard } from '../../Shared/PriceCard.js'
import { Context } from '../../Context/index.js'
import { useMemo } from 'react'

const useStyles = makeStyles<{ hidePriceCard: boolean }>()((theme, { hidePriceCard }) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    basic: {
        width: '100%',
        marginBottom: hidePriceCard ? 0 : 16,
    },
}))

const resolveTopListing = (orders: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>) => {
    if (!orders.length) return
    return first(
        orders.sort((a, b) => {
            const value_a = new BigNumber(a.priceInToken?.amount ?? 0)
            const value_b = new BigNumber(b.priceInToken?.amount ?? 0)
            return Number(value_b.lt(value_a))
        }),
    )
}

interface AboutTabProps {
    asset: Web3Helper.NonFungibleAssetAll | null | undefined
    isLoading: boolean
}

export function AboutTab(props: AboutTabProps) {
    const { asset, isLoading } = props
    const { orders, offers, sourceType } = Context.useContainer()
    const topListing = useMemo(() => resolveTopListing(offers), [offers])
    const hidePriceCard = !topListing && Boolean(orders.error) && !sourceType
    const { classes } = useStyles({ hidePriceCard })

    if (isLoading || !asset)
        return (
            <CollectibleCard>
                <div className={classes.body}>
                    <LoadingBase />
                </div>
            </CollectibleCard>
        )
    return (
        <CollectibleCard>
            <div className={classes.body}>
                <div className={classes.basic}>
                    <FigureCard hideSubTitle asset={asset} />
                </div>
                <PriceCard topListing={topListing} />
            </div>
        </CollectibleCard>
    )
}
