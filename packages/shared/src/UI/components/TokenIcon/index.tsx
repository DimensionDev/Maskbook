import { memo, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { first } from 'lodash-unified'
import { Avatar, AvatarProps, useTheme } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useChainId, useWeb3Hub, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, TokenType } from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import NO_IMAGE_COLOR from './constants'
import { useAccessibleURL } from '../../../hooks/useAccessibleURL'

const useStyles = makeStyles()((theme) => ({
    icon: {
        margin: 0,
    },
}))

export interface TokenIconProps extends withClasses<'icon'> {
    chainId?: Web3Helper.ChainIdAll
    pluginID?: NetworkPluginID
    address: string
    name?: string
    logoURL?: string
    isERC721?: boolean
    tokenType?: TokenType
    disableDefaultIcon?: boolean
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name, AvatarProps, classes, tokenType = TokenType.Fungible, disableDefaultIcon } = props

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
            urls: [logoURL, ...(logoURLs ?? [])].filter(Boolean) as string[],
        }
    }, [chainId, address, isNFT, logoURL, hub])
    const { urls = EMPTY_LIST, key } = value ?? {}
    const originalUrl = first(urls)
    const accessibleUrl = useAccessibleURL(key, originalUrl)

    if (!accessibleUrl && originalUrl && disableDefaultIcon) return null

    return (
        <TokenIconUI
            key={key}
            logoURL={isNFT ? logoURL : accessibleUrl || originalUrl}
            AvatarProps={AvatarProps}
            classes={classes}
            name={name}
        />
    )
}

export interface TokenIconUIProps extends withClasses<'icon'> {
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
    name?: string
}

export const TokenIconUI = memo<TokenIconUIProps>((props) => {
    const { logoURL, AvatarProps, name } = props
    const [error, setError] = useState(false)

    // add background color to no-img token icon
    const defaultBackgroundColorNumber = name?.split('')?.reduce((total, cur) => total + Number(cur?.charCodeAt(0)), 0)
    const defaultBackgroundColor = defaultBackgroundColorNumber
        ? NO_IMAGE_COLOR[defaultBackgroundColorNumber % 5]
        : undefined
    const classes = useStylesExtends(useStyles(), props)
    const theme = useTheme()

    return (
        <Avatar
            className={classes.icon}
            src={logoURL}
            {...AvatarProps}
            imgProps={{
                onError: () => {
                    setError(true)
                },
            }}
            sx={{
                ...AvatarProps?.sx,
                backgroundColor: logoURL && !error ? theme.palette.common.white : defaultBackgroundColor,
            }}>
            {name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})
