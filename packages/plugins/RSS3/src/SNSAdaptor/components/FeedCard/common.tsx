import { type ReverseAddressProps, ReversedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatBalance } from '@masknet/web3-shared-base'
import { Link, Typography } from '@mui/material'
import type { ComponentProps } from 'react'
import { type IntermediateRepresentation, type Opts } from 'linkifyjs'

const useStyles = makeStyles()((theme) => ({
    label: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1),
        fontWeight: 700,
        marginRight: theme.spacing(1),
        whiteSpace: 'nowrap',
        '&:first-of-type': {
            marginLeft: 0,
        },
        '&:last-of-type': {
            marginRight: 0,
        },
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

interface AddressLabelProps extends Omit<ReverseAddressProps, 'address'> {
    address?: ReverseAddressProps['address']
}
export function AddressLabel({ address, pluginID, size, className, ...rest }: AddressLabelProps) {
    const { classes, cx } = useStyles()
    return address ? (
        <ReversedAddress
            address={address}
            pluginID={pluginID}
            size={size}
            className={cx(classes.label, className)}
            component="span"
            {...rest}
        />
    ) : (
        <Label className={className} {...rest} />
    )
}

export const formatValue = (value?: { value: string; decimals: number } | null): string => {
    if (!value) return ''
    return formatBalance(value.value, value.decimals, 5)
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
    return htmlString.trimStart().replace(/<[^>]+>/g, '')
}
