import { makeStyles } from '@masknet/theme'
import { SourceType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()({
    provider: {
        position: 'relative',
        width: 24,
        height: 24,
        verticalAlign: 'bottom',
    },
    activeIcon: {
        position: 'absolute',
        width: 12,
        height: 12,
        right: 0,
        bottom: 0,
    },
})

export interface CollectibleProviderIconProps {
    active: boolean
    provider: SourceType
    overrideClasses?: string
}

const renderProviderIcon = (provider: SourceType) => {
    switch (provider) {
        case SourceType.NFTScan:
            return <Icons.NFTScan />
        case SourceType.Zerion:
            return <Icons.Zerion />
        case SourceType.OpenSea:
            return <Icons.OpenSea />
        case SourceType.Rarible:
            return <Icons.Rarible />
        case SourceType.Zora:
            return <Icons.Zora />
        case SourceType.RSS3:
            return <Icons.RSS3 />
        case SourceType.DeBank:
            return <Icons.Debank />
        case SourceType.Gem:
            return <Icons.Gem />
        case SourceType.LooksRare:
            return <Icons.LooksRare />
        case SourceType.X2Y2:
            return <Icons.X2Y2 />
        default:
            return <></>
    }
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const { provider, overrideClasses, active } = props
    const { classes, cx } = useStyles()
    const className = cx(classes.provider, overrideClasses)
    return (
        <div className={className}>
            {renderProviderIcon(provider)}
            {active ? <Icons.FillSuccess className={classes.activeIcon} /> : null}
        </div>
    )
}
