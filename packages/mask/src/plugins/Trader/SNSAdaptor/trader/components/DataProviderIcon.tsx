import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { Icons } from '@masknet/icons'

export interface DataProviderIconProps {
    provider: DataProvider
    size?: number
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <Icons.CoinGecko size={size} />
        case DataProvider.COIN_MARKET_CAP:
            return <Icons.CoinMarketCap size={size} />
        case DataProvider.UNISWAP_INFO:
            return <Icons.Uniswap size={size} />
        case DataProvider.NFTSCAN:
            return <Icons.NFTScan size={size} />
        default:
            unreachable(props.provider)
    }
}
