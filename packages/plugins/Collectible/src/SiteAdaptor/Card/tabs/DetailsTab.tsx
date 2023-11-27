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

interface DetailsTabProps {
    asset: Web3Helper.NonFungibleAssetAll | null | undefined
    isLoading: boolean
}

export function DetailsTab(props: DetailsTabProps) {
    const { asset, isLoading } = props
    const { classes } = useStyles()
    const { sourceType, rarity } = Context.useContainer()

    if (isLoading || !asset || rarity.isPending)
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
                    <DetailsCard sourceType={sourceType} asset={asset} />
                </div>
                <PropertiesCard rank={rarity.data?.rank} asset={asset} />
            </div>
        </CollectibleCard>
    )
}
