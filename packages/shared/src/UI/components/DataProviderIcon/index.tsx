import { DataProvider } from '@masknet/public-api'
import { Icons } from '@masknet/icons'

export interface DataProviderIconProps {
    provider: DataProvider
    size?: number
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case DataProvider.NFTScan:
            return <Icons.NFTScan size={size} />
        case DataProvider.CoinGecko:
            return <Icons.CoinGecko size={size} />
        case DataProvider.CoinMarketCap:
            return <Icons.CoinMarketCap size={size} />
        case DataProvider.UniswapInfo:
            return <Icons.Uniswap size={size} />
        default:
            return <></>
    }
}
