import { useMemo } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID, NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import { CollectibleState } from '../../hooks/useCollectibleState.js'
import { CollectibleTab } from '../CollectibleTab.js'
import { NFTBasicInfo } from '../../../../components/shared/NFTCard/NFTBasicInfo.js'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard.js'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    basic: {
        width: '100%',
        marginBottom: 16,
    },
}))

const resolveTopOffer = (orders?: Array<NonFungibleTokenOrder<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>>) => {
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
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
}

export function AboutTab(props: AboutTabProps) {
    const { asset } = props
    const { orders } = CollectibleState.useContainer()
    const { classes } = useStyles()

    const topOffer = resolveTopOffer(orders.value?.data)
    return useMemo(() => {
        if (asset.loading || !asset.value)
            return (
                <CollectibleTab>
                    <div className={classes.body}>
                        <LoadingBase />
                    </div>
                </CollectibleTab>
            )
        return (
            <CollectibleTab>
                <div className={classes.body}>
                    <div className={classes.basic}>
                        <NFTBasicInfo hideSubTitle asset={asset.value} />
                    </div>
                    <NFTPriceCard topOffer={topOffer} asset={asset.value} />
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
