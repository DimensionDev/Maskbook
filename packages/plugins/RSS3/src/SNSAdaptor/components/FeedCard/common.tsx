import { makeStyles } from '@masknet/theme'
import { formatBalance } from '@masknet/web3-shared-base'
import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/system'
import type { FC } from 'react'

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

interface Props extends TypographyProps {
    className?: string
    title?: string
}

export const Label: FC<Props> = ({ className, ...rest }) => {
    const { classes, cx } = useStyles()
    return <Typography className={cx(classes.label, className)} component="span" {...rest} />
}

export const formatValue = (value?: { value: string; decimals: number }): string => {
    if (!value) return ''
    return formatBalance(value.value, value.decimals, 5)
}
