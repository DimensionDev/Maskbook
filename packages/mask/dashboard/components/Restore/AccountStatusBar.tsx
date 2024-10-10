import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography, type BoxProps } from '@mui/material'
import { memo, type ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    label: {
        fontSize: 14,
        fontWeight: 700,
    },
    actionButton: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
}))
interface Props extends BoxProps {
    label?: string
    actionLabel: ReactNode
    onAction: () => void
}
export const AccountStatusBar = memo(function AccountStatusBar({ label, actionLabel, onAction, ...rest }: Props) {
    const { classes } = useStyles()
    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" {...rest}>
            {label ?
                <Typography className={classes.label}>{label}</Typography>
            :   null}
            <Button className={classes.actionButton} variant="text" onClick={onAction}>
                {actionLabel}
            </Button>
        </Box>
    )
})
