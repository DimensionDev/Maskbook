import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { type FC, memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    alert: {
        display: 'flex',
        borderRadius: 4,
        padding: 12,
        backgroundColor: theme.palette.mode === 'dark' ? '#15171A' : '#F9F9F9',
        fontSize: 14,
        alignItems: 'center',
        color: theme.palette.text.primary,
        gap: 10,
    },
}))
interface Props extends BoxProps {
    open?: boolean
    onClose?: () => void
}

export const Alert: FC<Props> = memo(function Alert({ className, children, open, onClose, ...rest }) {
    const { classes, cx } = useStyles()

    if (!open) return null

    return (
        <Box className={cx(classes.alert, className)} {...rest}>
            <Icons.Info size={20} />
            <Typography fontSize={14} fontFamily="Helvetica">
                {children}
            </Typography>
            <Icons.Close size={20} onClick={onClose} />
        </Box>
    )
})
