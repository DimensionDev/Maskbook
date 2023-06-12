import { TokenIcon, type TokenIconProps } from '@masknet/shared'
import type { TokenType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

export interface CoinIconProps extends TokenIconProps {
    type: TokenType
}

export const CoinIcon = ({ type, ...rest }: CoinIconProps) => {
    return <TokenIcon tokenType={type} pluginID={NetworkPluginID.PLUGIN_EVM} {...rest} />
}
