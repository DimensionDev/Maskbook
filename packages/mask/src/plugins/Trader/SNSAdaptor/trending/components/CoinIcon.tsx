import type { FC } from 'react'
import { TokenIcon, TokenIconProps } from '@masknet/shared'
import type { TokenType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

export interface CoinIconProps extends TokenIconProps {
    type: TokenType
}

export const CoinIcon: FC<CoinIconProps> = ({ type, ...rest }) => {
    return <TokenIcon tokenType={type} pluginID={NetworkPluginID.PLUGIN_EVM} {...rest} />
}
