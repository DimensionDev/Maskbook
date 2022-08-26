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

export interface OffersTabProps {}

export function OffersTab(props: OffersTabProps) {
    const { classes } = useStyles()
    const { orders } = NFTCardState.useContainer()
    return <div className={classes.wrapper}>orders</div>
}
