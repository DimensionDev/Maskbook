import { makeStyles } from '@masknet/theme'
import { OpenSeaIcon } from '../../../resources/OpenSeaIcon'
import { RaribleIcon } from '../../../resources/RaribleIcon'
import { unreachable } from '@dimensiondev/kit'
import { CollectibleProvider } from '../types'

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
})

export interface CollectibleProviderIconProps {
    provider: CollectibleProvider
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const { classes } = useStyles()
    switch (props.provider) {
        case CollectibleProvider.OPENSEA:
            return <OpenSeaIcon classes={{ root: classes.opensea }} viewBox="0 0 16 16" />
        case CollectibleProvider.RARIBLE:
            return <RaribleIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        case CollectibleProvider.SHOYU:
            return <RaribleIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        default:
            unreachable(props.provider)
    }
}
