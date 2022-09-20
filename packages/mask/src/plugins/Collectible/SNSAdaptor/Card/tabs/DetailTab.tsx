import { useMemo } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { CollectibleCard } from '../CollectibleCard.js'
import { DetailsCard } from '../../Shared/DetailsCard.js'
import { PropertiesCard } from '../../Shared/PropertiesCard.js'
import { Context } from '../../Context/index.js'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 300,
    },
    info: {
        width: '100%',
        marginBottom: 24,
    },
}))

export interface DetailTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetScope<'all'>>
}

export function DetailTab(props: DetailTabProps) {
    const { asset } = props
    const { sourceType, rarity } = Context.useContainer()
    const { classes } = useStyles()

    return useMemo(() => {
        if (asset.loading || !asset.value || rarity.loading)
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
                    <div className={classes.info}>
                        <DetailsCard sourceType={sourceType} asset={asset.value} />
                    </div>
                    <PropertiesCard rank={rarity.value?.rank} asset={asset.value} />
                </div>
            </CollectibleCard>
        )
    }, [asset, classes])
}
