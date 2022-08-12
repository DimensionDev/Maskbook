import { makeStyles } from '@masknet/theme'
import { ZoraIcon } from '../../../resources/ZoraIcon'
import { DebankIcon } from '../../../resources/DebankIcon'
import { SourceType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()({
    provider: {
        width: 24,
        height: 24,
        verticalAlign: 'bottom',
    },
})

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
            return <Icons.NFTScan className={className} />
        case SourceType.Zerion:
            return <img src={ZerionIcon} className={className} />
        case SourceType.OpenSea:
            return <Icons.OpenSea className={className} />
        case SourceType.Rarible:
            return <Icons.Rarible className={className} />
        case SourceType.Zora:
            return <ZoraIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.RSS3:
            return <Icons.RSS3 className={className} />
        case SourceType.DeBank:
            return <DebankIcon classes={{ root: className }} viewBox="0 0 16 16" />
        case SourceType.Gem:
            return <Icons.Gem className={className} />
        case SourceType.LooksRare:
            return <Icons.LooksRare className={className} />
        case SourceType.X2Y2:
            return <Icons.X2Y2 className={className} />
        default:
            return <></>
    }
}
