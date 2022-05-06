import { makeStyles, useStylesExtends } from '@masknet/theme'
import { CoinMarketCapIcon } from '../../../../resources/CoinMarketCapIcon'
import { CoinGeckoIcon } from '../../../../resources/CoinGeckoIcon'
import { UniswapIcon } from '../../../../resources/UniswapIcon'
import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'

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
    const classes = useStylesExtends(useStyles({ size: props.size ?? 16 }), {})
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
