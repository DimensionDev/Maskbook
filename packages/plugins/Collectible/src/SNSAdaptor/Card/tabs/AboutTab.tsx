import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { BigNumber } from 'bignumber.js'
import { first } from 'lodash-es'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { CollectibleCard } from '../CollectibleCard.js'
import { FigureCard } from '../../Shared/FigureCard.js'
import { PriceCard } from '../../Shared/PriceCard.js'
import { Context } from '../../Context/index.js'

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

const resolveTopOffer = (orders?: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>) => {
    if (!orders?.length) return
    return first(
        orders.sort((a, b) => {
            const value_a = new BigNumber(a.priceInToken?.amount ?? 0)
            const value_b = new BigNumber(b.priceInToken?.amount ?? 0)
            return Number(value_a.lt(value_b))
        }),
    )
}

export interface AboutTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetAll>
}

export function AboutTab(props: AboutTabProps) {
    const { asset } = props
    const { orders } = Context.useContainer()
    const topOffer = resolveTopOffer(orders?.value)
    const hidePriceCard = !topOffer && Boolean(orders.error)
    const { classes } = useStyles({ hidePriceCard })

    if (asset.loading || !asset.value)
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
                    <FigureCard hideSubTitle asset={asset.value} />
                </div>
                <PriceCard topOffer={topOffer} />
            </div>
        </CollectibleCard>
    )
}
