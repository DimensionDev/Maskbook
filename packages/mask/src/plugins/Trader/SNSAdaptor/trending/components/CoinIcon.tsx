import { TrendingCoinType } from '@masknet/web3-providers'
import { TokenIcon, TokenIconProps } from '@masknet/shared'
import type { FC } from 'react'
import { NetworkPluginID } from '@masknet/web3-shared-base'

interface CoinIconProps {
    type: TrendingCoinType
    address?: string
    logoUrl?: string
    name?: string
    size?: number
}
export const CoinIcon: FC<CoinIconProps> = ({ type, address, logoUrl, name, size }) => {
    const sharedProps: Partial<TokenIconProps> = {
        pluginID: NetworkPluginID.PLUGIN_EVM,
        name,
        AvatarProps: {
            sx: {
                height: size,
                width: size,
            },
        },
    }
    if (address && type === TrendingCoinType.Fungible) return <TokenIcon {...sharedProps} address={address} />
    if (type === TrendingCoinType.NonFungible) return <TokenIcon {...sharedProps} address="" logoURL={logoUrl} />
    return null
}
