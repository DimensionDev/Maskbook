import { useAsyncRetry } from 'react-use'
import { compact, first } from 'lodash-unified'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainId, useWeb3Hub } from '@masknet/web3-hooks-base'
import { TokenType } from '@masknet/web3-shared-base'
import type { AvatarProps } from '@mui/material'
import { useImageURL } from '../../../hooks/useImageURL.js'
import { Icon } from '../Icon/index.js'

export interface TokenIconProps {
    className?: string
    pluginID?: NetworkPluginID
    chainId?: Web3Helper.ChainIdAll
    address: string
    name: string
    symbol?: string
    logoURL?: string
    tokenType?: TokenType
    disableDefaultIcon?: boolean
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const {
        address,
        logoURL,
        name,
        symbol,
        AvatarProps,
        className,
        tokenType = TokenType.Fungible,
        disableDefaultIcon,
    } = props

    const chainId = useChainId(props.pluginID, props.chainId)
    const hub = useWeb3Hub(props.pluginID)
    const isNFT = tokenType === TokenType.NonFungible
    const { value } = useAsyncRetry(async () => {
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

    if (!accessibleUrl && originalUrl && disableDefaultIcon) return null

    return (
        <Icon
            key={key}
            className={className}
            name={symbol ?? name}
            logoURL={isNFT ? logoURL : accessibleUrl || originalUrl}
            AvatarProps={AvatarProps}
        />
    )
}
