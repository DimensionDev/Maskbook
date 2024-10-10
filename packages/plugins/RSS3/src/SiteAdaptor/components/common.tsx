import { ReversedAddress, type ReverseAddressProps } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'
import { formatBalance } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
// cspell:disable-next-line
import { type IntermediateRepresentation, type Opts } from 'linkifyjs'
import { useState, type ComponentProps } from 'react'
import { UserAvatar } from './UserAvatar/index.js'

const useStyles = makeStyles()((theme) => ({
    label: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
        whiteSpace: 'nowrap',
    },
    link: {
        color: theme.palette.maskColor.main,
        fontWeight: 700,
    },
}))

interface LabelProps extends ComponentProps<typeof Typography> {
    className?: string
    title?: string
}

export function Label({ className, ...rest }: LabelProps) {
    const { classes, cx } = useStyles()
    return <Typography className={cx(classes.label, className)} component="span" {...rest} />
}

interface AccountLabelProps extends Omit<ReverseAddressProps, 'address'> {
    handle?: string
    address?: ReverseAddressProps['address']
}
export function AccountLabel({
    address,
    handle,
    pluginID = NetworkPluginID.PLUGIN_EVM,
    size,
    className,
    ...rest
}: AccountLabelProps) {
    const { classes, cx } = useStyles()
    const [reversed, setReversed] = useState('')
    const label =
        handle ?
            <Label className={className} {...rest}>
                {handle}
            </Label>
        : address ?
            <ReversedAddress
                address={address}
                pluginID={pluginID}
                size={size}
                className={cx(classes.label, className)}
                component="span"
                onReverse={setReversed}
                {...rest}
            />
        :   <Label className={className} {...rest} />
    return (
        <>
            <UserAvatar identity={reversed || address} style={{ marginRight: 6 }} />
            {label}
        </>
    )
}

export const formatValue = (value?: { value: string; decimals: number } | null): string => {
    if (!value) return ''
    return formatBalance(value.value, value.decimals, { significant: 5 })
}

function LinkifyRender({ attributes, content }: IntermediateRepresentation) {
    const { classes, cx } = useStyles()
    return (
        <Link {...attributes} className={cx(classes.link, attributes.className)}>
            {content}
        </Link>
    )
}

export const LinkifyOptions: Opts = {
    target: '_blank',
    render: LinkifyRender,
}

export const htmlToPlain = (htmlString?: string) => {
    if (!htmlString) return htmlString
    return htmlString.trimStart().replaceAll(/<[^>]+>/g, '')
}

export function isRegisteringENS(feed: RSS3BaseAPI.CollectibleFeed) {
    return feed.actions[1]?.platform === 'ENS Registrar'
}
