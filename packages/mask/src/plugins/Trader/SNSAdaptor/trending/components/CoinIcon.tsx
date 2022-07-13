import { TokenIcon } from '@masknet/shared'
import { TrendingCoinType } from '@masknet/web3-providers'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import type { FC } from 'react'

interface CoinIconProps {
    type: TrendingCoinType
    address?: string
    logoUrl?: string
    name?: string
    size?: number
}
export const CoinIcon: FC<CoinIconProps> = ({ type, address, logoUrl, name, size }) => {
    return (
        <TokenIcon
            isERC721={type === TrendingCoinType.NonFungible}
            pluginID={NetworkPluginID.PLUGIN_EVM}
            name={name}
            AvatarProps={{
                sx: {
                    height: size,
                    width: size,
                },
            }}
            address={address ?? ''}
            logoURL={logoUrl}
        />
    )
}
