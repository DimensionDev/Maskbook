import { Icons } from '@masknet/icons'
import { TextOverflowTooltip, makeStyles } from '@masknet/theme'
import { Box, Drawer, Typography } from '@mui/material'
import { memo, useRef, type PropsWithChildren, useEffect } from 'react'

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

export interface BottomDrawerProps extends PropsWithChildren {
    open: boolean
    title: string
    onClose?: () => void
}

export const BottomDrawer = memo<BottomDrawerProps>(function BottomDrawer({ open, onClose, children, title }) {
    const { classes } = useStyles()
    const handleClose = () => onClose?.()
    const everOpenRef = useRef(false)
    useEffect(() => {
        if (open) everOpenRef.current = true
    }, [open])
    return (
        <Drawer anchor="bottom" onClose={handleClose} open={open} classes={{ paper: classes.root }}>
            <Box className={classes.header}>
                <TextOverflowTooltip title={title}>
                    <Typography className={classes.title}>{title}</Typography>
                </TextOverflowTooltip>
                <Icons.Close size={24} onClick={handleClose} />
            </Box>
            {open || everOpenRef.current ? children : null}
        </Drawer>
    )
})
