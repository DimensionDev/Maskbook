import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { RaribleIcon } from '../../../resources/RaribleIcon'
import { ZoraIcon } from '../../../resources/ZoraIcon'
import { RSS3Icon } from '../../../resources/RSS3Icon'
import { DebankIcon } from '../../../resources/DebankIcon'
import { SourceType } from '@masknet/web3-shared-base'

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

const NftScan = new URL('../../../resources/NFTScanIcon.png', import.meta.url).toString()
const ZerionIcon = new URL('../../../resources/zerion.png', import.meta.url).toString()

export interface CollectibleProviderIconProps {
    provider: SourceType
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const { classes } = useStyles()
    switch (props.provider) {
        case SourceType.NFTScan:
            return <img src={NftScan} className={classes.NFTScan} />
        case SourceType.Zerion:
            return <img src={ZerionIcon} className={classes.NFTScan} />
        case SourceType.OpenSea:
            return <OpenSeaIcon classes={{ root: classes.opensea }} viewBox="0 0 16 16" />
        case SourceType.Rarible:
            return <RaribleIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        case SourceType.Zora:
            return <ZoraIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        case SourceType.RSS3:
            return <RSS3Icon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        case SourceType.DeBank:
            return <DebankIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        default:
            return <></>
    }
}
