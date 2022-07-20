import { makeStyles } from '@masknet/theme'
import { NFTOfferCard } from '../../../components/shared/NFTCard/NFTOfferCard'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: '90%',
    },
}))

export interface OffersTabProps {
    asset: any
}

export function OffersTab(props: OffersTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    const _asset = asset.value
    return (
        <div className={classes.wrapper}>
            <NFTOfferCard offer="" />
        </div>
    )
}
