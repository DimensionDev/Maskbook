import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { compact, first } from 'lodash-es'
import { memo } from 'react'
import { useAsyncRetry } from 'react-use'
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
    const hub = useWeb3Hub(props.pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const { value } = useAsyncRetry(async () => {
        const key = address ? [chainId, address].join('/') : logoURL
        if (logoURL) {
            return {
                key,
                urls: [logoURL],
            }
        }
        const logoURLs = isNFT
            ? await hub?.getNonFungibleTokenIconURLs?.(chainId, address)
            : await hub?.getFungibleTokenIconURLs?.(chainId, address).catch(() => [])
        return {
            key,
            urls: compact([logoURL, ...(logoURLs ?? [])]),
        }
    }, [chainId, address, isNFT, logoURL, hub?.getNonFungibleTokenIconURLs, hub?.getFungibleTokenIconURLs])
    const originalUrl = first(value?.urls)

    if (originalUrl && disableDefaultIcon) return null
    return <Icon key={value?.key} {...rest} logoURL={isNFT ? logoURL : originalUrl} name={symbol ?? name} />
})
