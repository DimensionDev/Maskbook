import { TokenIcon, type TokenIconProps } from '@masknet/shared'
import type { TokenType } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'

interface CoinIconProps extends TokenIconProps {
    type: TokenType
}

export function CoinIcon({ type, ...rest }: CoinIconProps) {
    return <TokenIcon tokenType={type} pluginID={NetworkPluginID.PLUGIN_EVM} {...rest} />
}
