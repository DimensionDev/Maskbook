import { makeStyles } from '@masknet/theme'
import { NFTActivityCard, ActivityType } from '../../../components/shared/NFTCard/NFTActivityCard'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: '90%',
    },
}))

export interface ActivityTabProps {
    asset: NonFungibleAsset<ChainId, SchemaType>
}

export function ActivityTab(props: ActivityTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            <NFTActivityCard type={ActivityType.Sale} activity="" />
            <NFTActivityCard type={ActivityType.Transfer} activity="" />
            <NFTActivityCard type={ActivityType.Mint} activity="" />
        </div>
    )
}
