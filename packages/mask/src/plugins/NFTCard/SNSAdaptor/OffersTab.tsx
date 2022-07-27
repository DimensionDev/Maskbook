import { makeStyles } from '@masknet/theme'
import { NFTOfferCard } from '../../../components/shared/NFTCard/NFTOfferCard'
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

export interface OffersTabProps {
    asset: NonFungibleAsset<ChainId, SchemaType>
}

export function OffersTab(props: OffersTabProps) {
    const { asset } = props
    const { classes } = useStyles()
    return (
        <div className={classes.wrapper}>
            <NFTOfferCard offer="" />
            <NFTOfferCard offer="" />
            <NFTOfferCard offer="" />
        </div>
    )
}
