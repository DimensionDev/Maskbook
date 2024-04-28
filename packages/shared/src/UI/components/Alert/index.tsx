import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    alert: {
        display: 'flex',
        borderRadius: 4,
        padding: 12,
        backgroundColor: theme.palette.maskColor.bg,
        fontSize: 14,
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        backdropFilter: 'blur(5px)',
        gap: 10,
    },
}))
interface Props extends BoxProps {
    open?: boolean
    onClose?: () => void
}

export const Alert = memo(function Alert({ className, children, open, onClose, ...rest }: Props) {
    const { classes, cx } = useStyles()

    if (!open) return null

    return (
        <Box className={cx(classes.alert, className)} {...rest}>
            <Icons.Info size={20} />
            <Typography fontSize={14} component="div">
                {children}
            </Typography>
            {onClose ?
                <Icons.Close size={20} onClick={onClose} />
            :   null}
        </Box>
    )
})
