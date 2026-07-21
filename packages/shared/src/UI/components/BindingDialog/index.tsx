import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { IconButton, Box, type BoxProps } from '@mui/material'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    return {
        container: {
            display: 'flex',
            flexDirection: 'column',
            width: 400,
            height: 400,
            position: 'fixed',
            top: 24,
            right: 24,
            borderRadius: 12,
            backgroundColor: theme.vars.palette.maskColor.bottom,
            boxShadow: theme.vars.palette.maskColor.bottomBg,
            color: theme.vars.palette.maskColor.main,
            overflow: 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        title: {
            flexShrink: 0,
            background: theme.vars.palette.maskColor.modalTitleBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing(2),
            borderBottom: `1px solid ${theme.vars.palette.maskColor.line}`,
        },
        closeButton: {
            padding: 0,
        },
    }
})

export interface BindingDialogProps extends BoxProps {
    onClose?(): void
}

export const BindingDialog = memo<BindingDialogProps>(function BindingDialog({
    className,
    onClose,
    children,
    ...rest
}) {
    const { classes, cx } = useStyles()
    return (
        <Box role="dialog" {...rest} className={cx(classes.container, className)}>
            <Box className={classes.title}>
                <Icons.Mask width={100} height={28.8} />
                <IconButton size="large" disableTouchRipple classes={{ root: classes.closeButton }} onClick={onClose}>
                    <Icons.Close size={30} />
                </IconButton>
            </Box>
            {children}
        </Box>
    )
})
