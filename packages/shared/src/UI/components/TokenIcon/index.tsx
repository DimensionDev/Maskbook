import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useFungibleToken, useWeb3Hub } from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { memo } from 'react'
import { Icon, type IconProps } from '../Icon/index.js'

export interface TokenIconProps extends IconProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    symbol?: string
    tokenType?: TokenType
    disableDefaultIcon?: boolean
}

export const TokenIcon = memo(function TokenIcon(props: TokenIconProps) {
    const {
        pluginID = NetworkPluginID.PLUGIN_EVM,
        chainId: propChainId,
        address,
        logoURL,
        symbol,
        tokenType = TokenType.Fungible,
        disableDefaultIcon,
        name,
        ...rest
    } = props
    const { data: token } = useFungibleToken(pluginID, address, undefined, { chainId: propChainId })

    const { chainId } = useChainContext({ chainId: props.chainId })
    const Hub = useWeb3Hub(pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const { data } = useQuery({
        queryKey: ['token-icon', chainId, address],
        enabled: !logoURL && !isNFT,
        queryFn: async () => {
            const logoURLs = await Hub.getFungibleTokenIconURLs(chainId, address).catch(() => [])
            return first(logoURLs)
        },
    })

    if (data && disableDefaultIcon) return null
    const text = token?.name || token?.symbol || symbol || name || '?' // `?` prevent to fallback to avatar icon
    const url = logoURL || token?.logoURL || data
    return <Icon {...rest} logoURL={url} name={text} />
})
