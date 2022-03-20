import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { RaribleIcon } from '../../../resources/RaribleIcon'
import { ZoraIcon } from '../../../resources/ZoraIcon'
import { unreachable } from '@dimensiondev/kit'
import { NonFungibleAssetProvider } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()({
    opensea: {
        width: 16,
        height: 16,
        verticalAlign: 'bottom',
    },
    rarible: {
        width: 16,
        height: 16,
        verticalAlign: 'bottom',
    },
    NFTScan: {
        width: 16,
        height: 16,
        verticalAlign: 'bottom',
    },
})

const NFTScanIcon = new URL('../../../resources/NFTScanIcon.png', import.meta.url).toString()

export interface CollectibleProviderIconProps {
    provider: NonFungibleAssetProvider
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const { classes } = useStyles()
    switch (props.provider) {
        case NonFungibleAssetProvider.NFTSCAN:
            return <img src={NFTScanIcon} className={classes.NFTScan} />
        case NonFungibleAssetProvider.OPENSEA:
            return <OpenSeaIcon classes={{ root: classes.opensea }} viewBox="0 0 16 16" />
        case NonFungibleAssetProvider.RARIBLE:
            return <RaribleIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        case NonFungibleAssetProvider.ZORA:
            return <ZoraIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        default:
            unreachable(props.provider)
    }
}
