import { getMaskColor, makeStyles } from '@masknet/theme'
import type { AddressName } from '@masknet/web3-shared-evm'
import { CollectionList } from '../../../extension/options-page/DashboardComponents/CollectibleList'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    text: {
        paddingTop: 36,
        paddingBottom: 36,
        '& > p': {
            color: getMaskColor(theme).textPrimary,
        },
    },
}))

export interface NFTPageProps {
    addressName?: AddressName
}

export function NFTPage(props: NFTPageProps) {
    const { addressName } = props
    const { classes } = useStyles()

    if (!addressName) return null

    return (
        <div className={classes.root}>
            <CollectionList address={addressName.resolvedAddress ?? ''} />
        </div>
    )
}
