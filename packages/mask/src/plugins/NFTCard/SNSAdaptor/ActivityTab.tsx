import { makeStyles } from '@masknet/theme'
import { NFTActivityCard } from '../../../components/shared/NFTCard/NFTActivityCard'

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
            <NFTActivityCard activity="" />
            <NFTActivityCard activity="" />
            <NFTActivityCard activity="" />
        </div>
    )
}
