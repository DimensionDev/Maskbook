import { makeStyles } from '@masknet/theme'
import { NFTCardState } from '../hooks/useNFTCardState'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: '90%',
    },
}))

export interface ActivityTabProps {}

export function ActivityTab(props: ActivityTabProps) {
    const { classes } = useStyles()
    const { events } = NFTCardState.useContainer()
    return <div className={classes.wrapper}>events</div>
}
