import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, type AlertProps } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { memo } from 'react'

const useStyles = makeStyles<void, 'warning'>()((theme, _, refs) => ({
    warning: {},
    alert: {
        display: 'flex',
        borderRadius: 4,
        padding: 12,
        backgroundColor: theme.vars.palette.maskColor.bg,
        fontSize: 14,
        alignItems: 'center',
        color: theme.vars.palette.maskColor.main,
        backdropFilter: 'blur(5px)',
        gap: 10,
        [`&.${refs.warning}`]: {
            backgroundColor: 'rgba(255, 177, 0, 0.1)',
            color: '#FFB100',
        },
    },
}))
interface Props extends BoxProps, Pick<AlertProps, 'severity'> {
    open?: boolean
    onClose?: () => void
}

export const Alert = memo<Props>(function Alert({ className, children, open, onClose, severity, ...rest }: Props) {
    const { classes, cx } = useStyles()

    if (!open) return null

    return (
        <Box
            className={cx(classes.alert, className, {
                [classes.warning]: severity === 'warning',
            })}
            {...rest}>
            {severity === 'warning' ?
                <Icons.WarningTriangle size={20} />
            :   <Icons.Info size={20} />}
            <Typography sx={{ fontSize: 14 }} component="div">
                {children}
            </Typography>
            {onClose ?
                <Icons.Close size={20} onClick={onClose} />
            :   null}
        </Box>
    )
})
