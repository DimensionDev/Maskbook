import { unreachable } from '@dimensiondev/kit'
import { Icon } from '@masknet/icons'
import { DataProvider } from '@masknet/public-api'

export interface DataProviderIconProps {
    provider: DataProvider
    size?: number
}

export function DataProviderIconUI(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case DataProvider.COIN_GECKO:
            return <Icon type="coinGecko" size={size} />
        case DataProvider.COIN_MARKET_CAP:
            return <Icon type="coinMarketCap" size={size} />
        case DataProvider.UNISWAP_INFO:
            return <Icon type="uniswap" size={size} />
        case DataProvider.NFTSCAN:
            return <Icon type="nftScan" />
        default:
            unreachable(props.provider)
    }
}
