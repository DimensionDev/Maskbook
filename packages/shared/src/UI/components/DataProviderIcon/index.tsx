import { SourceType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

export interface DataProviderIconProps {
    provider: SourceType
    size?: number
}

export function DataProviderIcon(props: DataProviderIconProps) {
    const { size = 16 } = props
    switch (props.provider) {
        case SourceType.NFTScan:
            return <Icons.NFTScan size={size} />
        case SourceType.Gem:
            return <Icons.Gem size={size} />
        case SourceType.Rarible:
            return <Icons.Rarible size={size} />
        case SourceType.OpenSea:
            return <Icons.OpenSea size={size} />
        case SourceType.CoinGecko:
            return <Icons.CoinGecko size={size} />
        case SourceType.CoinMarketCap:
            return <Icons.CoinMarketCap size={size} />
        case SourceType.UniswapInfo:
            return <Icons.Uniswap size={size} />
        default:
            return <></>
    }
}
