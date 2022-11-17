import { ReverseAddressProps, ReversedAddress } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatBalance } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { ComponentProps, FC } from 'react'

const useStyles = makeStyles()((theme) => ({
    label: {
        color: theme.palette.maskColor.main,
        marginLeft: theme.spacing(1),
        fontWeight: 700,
        marginRight: theme.spacing(1),
        '&:first-of-type': {
            marginLeft: 0,
        },
        '&:last-of-type': {
            marginRight: 0,
        },
    },
}))

interface LabelProps extends ComponentProps<typeof Typography> {
    className?: string
    title?: string
}

export const Label: FC<LabelProps> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    return <Typography className={cx(classes.label, className)} component="span" {...rest} />
}

interface AddressLabelProps extends Omit<ReverseAddressProps, 'address'> {
    address?: ReverseAddressProps['address']
}
export const AddressLabel: FC<AddressLabelProps> = ({ address, pluginID, size, className, ...rest }) => {
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

export const formatValue = (value?: { value: string; decimals: number }): string => {
    if (!value) return ''
    return formatBalance(value.value, value.decimals, 5)
}
