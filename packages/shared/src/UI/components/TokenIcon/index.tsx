import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
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
    const { address, logoURL, name, symbol, tokenType = TokenType.Fungible, disableDefaultIcon, ...rest } = props

    const { chainId } = useChainContext({ chainId: props.chainId })
    const Hub = useWeb3Hub(props.pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const key = address ? [chainId, address].join('/') : logoURL
    const { data } = useQuery({
        queryKey: ['token-icon', chainId, address, isNFT],
        enabled: !logoURL,
        queryFn: async () => {
            const logoURLs = isNFT
                ? await Hub.getNonFungibleTokenIconURLs(chainId, address)
                : await Hub.getFungibleTokenIconURLs(chainId, address).catch(() => [])
            return first(logoURLs)
        },
    })

    if (data && disableDefaultIcon) return null
    return <Icon key={key} {...rest} logoURL={isNFT ? logoURL : data || logoURL} name={symbol ?? name} />
})
