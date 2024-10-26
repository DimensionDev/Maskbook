import { SourceType } from '@masknet/web3-shared-base'
import { Icons, type GeneratedIcon, type GeneratedIconProps } from '@masknet/icons'

export interface SourceProviderIconProps extends GeneratedIconProps {
    provider: SourceType
}

const IconMap: Partial<Record<SourceType, GeneratedIcon>> = {
    [SourceType.NFTScan]: Icons.NFTScan,
    [SourceType.Gem]: Icons.Gem,
    [SourceType.Rarible]: Icons.Rarible,
    [SourceType.OpenSea]: Icons.OpenSea,
    [SourceType.CoinGecko]: Icons.CoinGecko,
    [SourceType.Uniswap]: Icons.Uniswap,
    [SourceType.LooksRare]: Icons.LooksRare,
    [SourceType.X2Y2]: Icons.X2Y2,
    [SourceType.SimpleHash]: Icons.SimpleHash,
}

export function SourceProviderIcon({ provider, ...rest }: SourceProviderIconProps) {
    const Icon = IconMap[provider]
    if (!Icon) return null
    return <Icon {...rest} />
}
