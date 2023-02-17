import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CollectibleCard } from '../CollectibleCard.js'
import { DetailsCard } from '../../Shared/DetailsCard.js'
import { PropertiesCard } from '../../Shared/PropertiesCard.js'
import { Context } from '../../Context/index.js'

const useStyles = makeStyles()((theme) => ({
    body: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    info: {
        width: '100%',
        marginBottom: 24,
    },
}))

export interface DetailsTabProps {
    asset: AsyncState<Web3Helper.NonFungibleAssetAll>
}

export function DetailsTab(props: DetailsTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    const { sourceType, rarity } = Context.useContainer()

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
}
