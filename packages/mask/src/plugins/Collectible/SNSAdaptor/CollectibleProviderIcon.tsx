import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { RaribleIcon } from '../../../resources/RaribleIcon'
import { ZoraIcon } from '../../../resources/ZoraIcon'
import { RSS3Icon } from '../../../resources/RSS3Icon'
import { DebankIcon } from '../../../resources/DebankIcon'
import { GemIcon } from '../../../resources/GemIcon'
import { X2Y2Icon } from '../../../resources/X2Y2Icon'
import { LooksRareIcon } from '../../../resources/LooksRareIcon'
import { SourceType } from '@masknet/web3-shared-base'

const useStyles = makeStyles()({
    provider: {
        width: 24,
        height: 24,
        verticalAlign: 'bottom',
    },
})

const NftScan = new URL('../../../resources/NFTScanIcon.png', import.meta.url).toString()
const ZerionIcon = new URL('../../../resources/zerion.png', import.meta.url).toString()

export interface CollectibleProviderIconProps {
    provider: SourceType
    overrideClasses?: string
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const { classes, cx } = useStyles()
    const className = cx(classes.provider, props.overrideClasses)
    switch (props.provider) {
        case SourceType.NFTScan:
            return <img src={NftScan} className={className} />
        case SourceType.Zerion:
            return <img src={ZerionIcon} className={className} />
        case SourceType.OpenSea:
            return <OpenSeaIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.Rarible:
            return <RaribleIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.Zora:
            return <ZoraIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.RSS3:
            return <RSS3Icon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.DeBank:
            return <DebankIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.Gem:
            return <GemIcon classes={{ root: className }} viewBox="0 0 24 25" />
        case SourceType.LooksRare:
            return <LooksRareIcon classes={{ root: className }} viewBox="0 0 24 25" />
        case SourceType.X2Y2:
            return <X2Y2Icon classes={{ root: className }} viewBox="0 0 24 25" />
        default:
            return <></>
    }
}
