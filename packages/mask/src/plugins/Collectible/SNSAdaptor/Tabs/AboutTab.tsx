import { LoadingBase, makeStyles } from '@masknet/theme'
import { useMemo } from 'react'
import type { Web3Helper } from '@masknet/plugin-infra/src/web3-helpers'
import type { NetworkPluginID, SourceType, NonFungibleTokenOrder } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import BigNumber from 'bignumber.js'
import { first } from 'lodash-unified'
import { CollectibleState } from '../../hooks/useCollectibleState'
import { CollectibleTab } from '../CollectibleTab'
import { NFTBasicInfo } from '../../../../components/shared/NFTCard/NFTBasicInfo'
import { NFTPriceCard } from '../../../../components/shared/NFTCard/NFTPriceCard'

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

export interface AboutTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<void, NetworkPluginID.PLUGIN_EVM>>
    onChangeProvider: (v: SourceType) => void
    providers: SourceType[]
    currentProvider: SourceType
}

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

export function AboutTab(props: AboutTabProps) {
    const { asset, providers, currentProvider, onChangeProvider } = props
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
                        <NFTBasicInfo
                            currentProvider={currentProvider}
                            providers={providers}
                            onChangeProvider={onChangeProvider}
                            hideSubTitle
                            asset={asset.value}
                        />
                    </div>
                    <NFTPriceCard topOffer={topOffer} asset={asset.value} />
                </div>
            </CollectibleTab>
        )
    }, [asset, classes])
}
