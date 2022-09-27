import { TokenIcon } from '@masknet/shared'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'
import type { FC } from 'react'

export interface CoinIconProps {
    type: TokenType
    logoUrl?: string
    address: string
    name: string
    symbol?: string
    size?: number
}

export const CoinIcon: FC<CoinIconProps> = ({ type, address, logoUrl, name, symbol, size }) => {
    return (
        <TokenIcon
            tokenType={type}
            pluginID={NetworkPluginID.PLUGIN_EVM}
            name={name}
            symbol={symbol}
            address={address}
            logoURL={logoUrl}
            AvatarProps={{
                sx: {
                    height: size,
                    width: size,
                },
            }}
        />
    )
}
