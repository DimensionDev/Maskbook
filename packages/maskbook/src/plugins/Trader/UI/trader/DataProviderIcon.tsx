import { makeStyles } from '@material-ui/core'
import { CoinMarketCapIcon } from '../../../../resources/CoinMarketCapIcon'
import { CoinGeckoIcon } from '../../../../resources/CoinGeckoIcon'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '../../types'

const useStyles = makeStyles((theme) => {
    return {
        cmc: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
        coin_gecko: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
        uniswap: {
            width: 16,
            height: 16,
            verticalAlign: 'bottom',
        },
    }
})

export interface DataProviderIconProps {
    provider: DataProvider
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const classes = useStyles()

    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <CoinGeckoIcon classes={{ root: classes.coin_gecko }} viewBox="0 0 16 16" />
        case DataProvider.COIN_MARKET_CAP:
            return <CoinMarketCapIcon classes={{ root: classes.cmc }} viewBox="0 0 16 16" />
        case DataProvider.UNISWAP_INFO:
            return <UniswapIcon classes={{ root: classes.uniswap }} viewBox="0 0 16 16" />
        default:
            unreachable(props.provider)
    }
}
