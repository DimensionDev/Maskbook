import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import type { FC, ReactNode } from 'react'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
        width: 480,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
        padding: theme.spacing(3),
        boxSizing: 'border-box',
        color: theme.palette.text.primary,
        textAlign: 'center',
        fontSize: 18,
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: {
        padding: theme.spacing(0, 3, 3),
    },
}))

interface Props extends InjectedDialogProps {
    message: string | ReactNode
    icon?: ReactNode
    confirmText?: string
    onConfirm?(): void
}

export const ConfirmModal: FC<Props> = ({ className, message, icon, confirmText, onConfirm, ...rest }) => {
    const { classes } = useStyles()
    confirmText = confirmText || 'Confirm'
    return (
        <InjectedDialog
            classes={{
                paper: classes.confirmDialog,
            }}
            BackdropProps={{
                style: {
                    opacity: 0,
                },
            }}
            {...rest}>
            <DialogContent className={classes.content}>
                {icon ? <div className={classes.icon}>{icon}</div> : null}
                {typeof message === 'string' ? <Typography>{message}</Typography> : message}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
