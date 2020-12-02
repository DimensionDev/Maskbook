import { createStyles, makeStyles } from '@material-ui/core'
import { CoinMarketCapIcon } from '../../../../resources/CoinMarketCapIcon'
import { unreachable } from '../../../../utils/utils'
import { DataProvider } from '../../types'

const useStyles = makeStyles((theme) => {
    return createStyles({
        cmc: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
    })
})

export interface DataProviderIconProps {
    provider: DataProvider
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const classes = useStyles()

    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return null
        case DataProvider.COIN_MARKET_CAP:
            return <CoinMarketCapIcon classes={{ root: classes.cmc }} viewBox="0 0 16 16" />
        default:
            unreachable(props.provider)
    }
}
