import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Drawer, Typography } from '@mui/material'
import { memo, type PropsWithChildren } from 'react'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2.25),
        borderRadius: '24px 24px 0 0',
    },
    header: {
        display: 'flex',
        width: '100%',
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontWeight: 700,
        flex: 1,
        paddingTop: theme.spacing(3),
        paddingLeft: theme.spacing(4),
    },
}))

export interface BottomDrawerProps extends PropsWithChildren {
    open: boolean
    title: string
    onClose?: () => void
}

export const BottomDrawer = memo<BottomDrawerProps>(function BottomDrawer({ open, onClose, children, title }) {
    const { classes } = useStyles()
    const handleClose = () => onClose?.()
    return (
        <Drawer anchor="bottom" onClose={handleClose} open={open} classes={{ paper: classes.root }}>
            <Box className={classes.header}>
                <Typography className={classes.title}>{title}</Typography>
                <Icons.Close size={24} onClick={handleClose} />
            </Box>
            {children}
        </Drawer>
    )
})
