import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'
import type { FC } from 'react'

interface CoinIconProps {
    type: TokenType
    address?: string
    logoUrl?: string
    name?: string
    size?: number
}
export const CoinIcon: FC<CoinIconProps> = ({ type, address, logoUrl, name, size }) => {
    return (
        <TokenIcon
            tokenType={type}
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
