import { useAsyncRetry } from 'react-use'
import { compact, first } from 'lodash-es'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useWeb3Hub } from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import { useImageURL } from '../../../hooks/useImageURL.js'
import { Icon, IconProps } from '../Icon/index.js'

export interface TokenIconProps extends IconProps {
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address?: string
    symbol?: string
    tokenType?: TokenType
    disableDefaultIcon?: boolean
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name, symbol, tokenType = TokenType.Fungible, disableDefaultIcon, ...rest } = props

    const { chainId } = useChainContext({ chainId: props.chainId })
    const hub = useWeb3Hub(props.pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const { value } = useAsyncRetry(async () => {
        if (!address)
            return {
                key: logoURL,
                urls: [],
            }
        const logoURLs = isNFT
            ? await hub?.getNonFungibleTokenIconURLs?.(chainId, address)
            : await hub?.getFungibleTokenIconURLs?.(chainId, address).catch(() => [])
        const key = address ? [chainId, address].join('/') : logoURL
        return {
            key,
            urls: compact([logoURL, ...(logoURLs ?? [])]),
        }
    }, [chainId, address, isNFT, logoURL, hub?.getNonFungibleTokenIconURLs, hub?.getFungibleTokenIconURLs])
    const { urls = EMPTY_LIST, key } = value ?? {}
    const originalUrl = first(urls)
    const { value: accessibleUrl } = useImageURL(originalUrl)

    if (disableDefaultIcon) return null

    return <Icon key={key} {...rest} logoURL={isNFT ? logoURL : accessibleUrl || originalUrl} name={symbol ?? name} />
}
