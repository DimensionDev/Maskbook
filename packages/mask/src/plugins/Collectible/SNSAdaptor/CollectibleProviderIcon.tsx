import { makeStyles } from '@masknet/theme'
import { SourceType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()({
    provider: {
        width: 24,
        height: 24,
        verticalAlign: 'bottom',
    },
})

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
            return <Icons.Zerion className={className} />
        case SourceType.OpenSea:
            return <Icons.OpenSea className={className} />
        case SourceType.Rarible:
            return <Icons.Rarible className={className} />
        case SourceType.Zora:
            return <Icons.Zora className={className} />
        case SourceType.RSS3:
            return <Icons.RSS3 className={className} />
        case SourceType.DeBank:
            return <Icons.Debank className={className} />
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
