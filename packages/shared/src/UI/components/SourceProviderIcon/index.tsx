import { SourceType } from '@masknet/web3-shared-base'
import { Icons, type GeneratedIcon, type GeneratedIconProps } from '@masknet/icons'

export interface SourceProviderIconProps extends GeneratedIconProps {
    provider: SourceType
}

const IconMap: Partial<Record<SourceType, GeneratedIcon>> = {
    [SourceType.CoinGecko]: Icons.CoinGecko,
    [SourceType.UniswapInfo]: Icons.Uniswap,
}

export function SourceProviderIcon({ provider, ...rest }: SourceProviderIconProps) {
    const Icon = IconMap[provider]
    if (!Icon) return null
    return <Icon {...rest} />
}
