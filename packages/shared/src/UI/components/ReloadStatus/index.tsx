import { makeStyles } from '@masknet/theme'
import { Box, Typography, type BoxProps, Button } from '@mui/material'
import { memo } from 'react'
import { useSharedI18N } from '../../../index.js'

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    text: {
        color: theme.palette.maskColor.second,
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '36px',
    },
    button: {
        marginTop: theme.spacing(1.5),
        fontSize: '12px',
        fontWeight: 700,
        minWidth: theme.spacing(11),
        height: theme.spacing(4),
    },
}))

interface Props extends BoxProps {
    message?: string
    actionLabel?: string
    onRetry?(): void
}

export const ReloadStatus = memo(function ReloadStatus({
    className,
    children,
    message,
    actionLabel,
    onRetry,
    ...rest
}: Props) {
    const { classes, cx } = useStyles()
    const t = useSharedI18N()
    return (
        <Box className={cx(classes.statusBox, className)} p={2} {...rest}>
            <Typography className={classes.text}>{message ?? t.load_failed()}</Typography>
            <Button className={classes.button} onClick={() => onRetry?.()} variant="roundedContained" size="medium">
                {actionLabel ?? t.load_retry()}
            </Button>
        </Box>
    )
})
