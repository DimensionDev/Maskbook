import { makeStyles } from '@masknet/theme'
import { NFTPriceCard } from '../../../components/shared/NFTCard/NFTPriceCard'
import { NFTInfoCard } from '../../../components/shared/NFTCard/NFTInfoCard'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
    },
}))

export interface AboutTabProps {
    asset: any
}

export function AboutTab(props: AboutTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            <NFTPriceCard asset={asset} />
            <NFTInfoCard asset={asset} />
        </div>
    )
}
