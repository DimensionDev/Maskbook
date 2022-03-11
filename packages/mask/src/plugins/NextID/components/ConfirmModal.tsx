import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@mui/material'
import type { FC, ReactNode } from 'react'
import { InjectedDialog, InjectedDialogProps } from '../../../components/shared/InjectedDialog'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
        width: 480,
        height: 290,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
        padding: theme.spacing(3),
        boxSizing: 'border-box',
    },
    icon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        color: theme.palette.text.primary,
        textAlign: 'center',
        fontSize: 18,
    },
    actions: {
        marginTop: theme.spacing(3),
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
            {...rest}>
            <DialogContent className={classes.content}>
                {icon ? <div className={classes.icon}>{icon}</div> : null}
                <div className={classes.message}>{message}</div>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
