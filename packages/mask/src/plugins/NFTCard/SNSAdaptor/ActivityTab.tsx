import { makeStyles } from '@masknet/theme'
import { NFTActivityCard, ActivityType } from '../../../components/shared/NFTCard/NFTActivityCard'

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
    asset: any
}

export function ActivityTab(props: ActivityTabProps) {
    const { asset } = props
    const { classes } = useStyles()

    const _asset = asset.value
    return (
        <div className={classes.wrapper}>
            <NFTActivityCard type={ActivityType.Sale} activity="" />
            <NFTActivityCard type={ActivityType.Transfer} activity="" />
            <NFTActivityCard type={ActivityType.Mint} activity="" />
        </div>
    )
}
