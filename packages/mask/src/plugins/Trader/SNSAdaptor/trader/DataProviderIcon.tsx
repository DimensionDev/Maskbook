import { makeStyles } from '@masknet/theme'
import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { CoinGecko as CoinGeckoIcon, CoinMarketCap as CoinMarketCapIcon, Uniswap as UniswapIcon } from '@masknet/icons'

interface StyleProps {
    size: number
}

const useStyles = makeStyles<StyleProps>()((theme, { size }) => ({
    cmc: {
        width: size,
        height: size,
        verticalAlign: 'bottom',
    },
    coin_gecko: {
        width: size,
        height: size,
        verticalAlign: 'bottom',
    },
    uniswap: {
        width: size,
        height: size,
        verticalAlign: 'bottom',
    },
}))

export interface DataProviderIconProps {
    provider: DataProvider
    size?: number
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <CoinGeckoIcon size={size} />
        case DataProvider.COIN_MARKET_CAP:
            return <CoinMarketCapIcon size={size} />
        case DataProvider.UNISWAP_INFO:
            return <UniswapIcon size={size} />
        default:
            unreachable(props.provider)
    }
}
