import { memo } from 'react'
import { Avatar, AvatarProps } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import NO_IMAGE_COLOR from './constants'
import { useChainId, useWeb3Hub, Web3Helper } from '@masknet/plugin-infra/web3'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useImageFailOver } from '../../../hooks'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useImageBase64 } from '../../../hooks/useImageBase64'
import { first } from 'lodash-es'

const useStyles = makeStyles()((theme) => ({
    icon: {
        backgroundColor: theme.palette.common.white,
        margin: 0,
    },
}))

export interface TokenIconProps extends withClasses<'icon'> {
    chainId?: Web3Helper.ChainIdAll
    pluginID?: NetworkPluginID
    address: string
    name?: string
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
}

export function TokenIcon(props: TokenIconProps) {
    const { address, logoURL, name, AvatarProps, classes } = props

    const chainId = useChainId(props.pluginID, props.chainId)
    const hub = useWeb3Hub(props.pluginID)

    const { value: urls = EMPTY_LIST } = useAsyncRetry(async () => {
        const logoURLs = await hub?.getFungibleTokenIconURLs?.(chainId, address)
        return [logoURL, ...(logoURLs ?? [])].filter(Boolean) as string[]
    }, [chainId, address, logoURL, hub])
    const base64 = useImageBase64(`${address}_${chainId}`, first(urls))

    return <TokenIconUI logoURL={base64} AvatarProps={AvatarProps} classes={classes} name={name} />
}

export interface TokenIconUIProps extends withClasses<'icon'> {
    logoURL?: string
    AvatarProps?: Partial<AvatarProps>
    name?: string
}

export const TokenIconUI = memo<TokenIconUIProps>((props) => {
    const { logoURL, AvatarProps, name } = props

    // add background color to no-img token icon
    const defaultBackgroundColorNumber = name?.split('')?.reduce((total, cur) => total + Number(cur?.charCodeAt(0)), 0)
    const defaultBackgroundColor = defaultBackgroundColorNumber
        ? NO_IMAGE_COLOR?.[defaultBackgroundColorNumber % 5]
        : undefined
    const classes = useStylesExtends(useStyles(), props)

    return (
        <Avatar
            className={classes.icon}
            src={logoURL}
            style={{ backgroundColor: logoURL ? undefined : defaultBackgroundColor }}
            {...AvatarProps}>
            {name?.slice(0, 1).toUpperCase()}
        </Avatar>
    )
})
