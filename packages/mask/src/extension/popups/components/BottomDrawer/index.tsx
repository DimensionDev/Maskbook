import { Icons } from '@masknet/icons'
import { TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { Box, Drawer, Typography } from '@mui/material'
import { memo, type ReactNode } from 'react'

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
        whiteSpace: 'nowrap',
        flex: 1,
        paddingTop: theme.spacing(3),
        paddingLeft: theme.spacing(4),
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}))

export interface BottomDrawerProps extends withClasses<'title' | 'root' | 'header'> {
    open: boolean
    children?: ReactNode
    title: string
    onClose?: () => void
}

export const BottomDrawer = memo<BottomDrawerProps>(function BottomDrawer({ open, onClose, children, title, ...rest }) {
    const { classes } = useStyles(undefined, { props: rest })
    const handleClose = () => onClose?.()
    return (
        <Drawer anchor="bottom" onClose={handleClose} open={open} classes={{ paper: classes.root }}>
            <Box className={classes.header}>
                <TextOverflowTooltip title={title}>
                    <Typography className={classes.title}>{title}</Typography>
                </TextOverflowTooltip>
                <Icons.Close size={24} onClick={handleClose} />
            </Box>
            {children}
        </Drawer>
    )
})
