import { makeStyles, useStylesExtends } from '@masknet/theme'
// import { CoinGeckoIcon } from '../../../../resources/CoinGeckoIcon'
// import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { CoinGekoIcon, CoinMarketCapIcon, UniswapIcon } from '@masknet/icons'

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
    const classes = useStylesExtends(useStyles({ size }), {})
    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <CoinGekoIcon style={{ width: size, height: size }} />
        case DataProvider.COIN_MARKET_CAP:
            return <CoinMarketCapIcon style={{ width: size, height: size }} />
        case DataProvider.UNISWAP_INFO:
            return <UniswapIcon style={{ width: size, height: size }} />
        default:
            unreachable(props.provider)
    }
}
