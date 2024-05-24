import { SourceType } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'

export interface SourceProviderIconProps {
    provider: SourceType
    size?: number
}

export function SourceProviderIcon(props: SourceProviderIconProps) {
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
        case SourceType.LooksRare:
            return <Icons.LooksRare size={size} />
        case SourceType.X2Y2:
            return <Icons.X2Y2 size={size} />
        case SourceType.SimpleHash:
            return <Icons.SimpleHash size={size} />
        default:
            return null
    }
}
