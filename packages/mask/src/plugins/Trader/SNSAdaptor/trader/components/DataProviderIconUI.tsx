import { unreachable } from '@dimensiondev/kit'
import { DataProvider } from '@masknet/public-api'
import { CoinGeckoIcon, CoinMarketCapIcon, UniswapIcon, NFTScanIcon } from '@masknet/icons'

export interface DataProviderIconProps {
    provider: DataProvider
    size?: number
}

export function DataProviderIconUI(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <CoinGeckoIcon style={{ width: size, height: size }} />
        case DataProvider.COIN_MARKET_CAP:
            return <CoinMarketCapIcon style={{ width: size, height: size }} />
        case DataProvider.UNISWAP_INFO:
            return <UniswapIcon style={{ width: size, height: size }} />
        case DataProvider.NFTSCAN:
            return <NFTScanIcon style={{ width: size, height: size }} />
        default:
            unreachable(props.provider)
    }
}
