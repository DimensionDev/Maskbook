import { createStyles, makeStyles } from '@material-ui/core'
import { CoinGeckoIcon } from '../../../resources/CoinGeckoIcon'
import { CoinMarketCapIcon } from '../../../resources/CoinMarketCapIcon'
import { unreachable } from '../../../utils/utils'
import { CollectibleProvider } from '../types'

const useStyles = makeStyles((theme) => {
    return createStyles({
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
})

export interface CollectibleProviderIconProps {
    provider: CollectibleProvider
}

export function CollectibleProviderIcon(props: CollectibleProviderIconProps) {
    const classes = useStyles()

    switch (props.provider) {
        case CollectibleProvider.OPENSEA:
            return <CoinGeckoIcon classes={{ root: classes.opensea }} viewBox="0 0 16 16" />
        case CollectibleProvider.RARIBLE:
            return <CoinMarketCapIcon classes={{ root: classes.rarible }} viewBox="0 0 16 16" />
        default:
            unreachable(props.provider)
    }
}
