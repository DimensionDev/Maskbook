import { makeStyles } from '@masknet/theme'
import { NFTPriceCard } from '../../../components/shared/NFTCard/NFTPriceCard'
import { NFTInfoCard } from '../../../components/shared/NFTCard/NFTInfoCard'
import { NFTDescription } from '../../../components/shared/NFTCard/NFTDescription'
import { NFTPropertiesCard } from '../../../components/shared/NFTCard/NFTPropertiesCard'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        width: '100%',
        maxHeight: 'calc( 100% - 72px)',
        overflowY: 'auto',
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
            <NFTDescription asset={asset} />
            <NFTPropertiesCard asset={asset} />
        </div>
    )
}
