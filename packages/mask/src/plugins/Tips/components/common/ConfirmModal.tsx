import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent } from '@mui/material'
import type { FC, PropsWithChildren } from 'react'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
        width: 420,
        height: 420,
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
    actions: {
        padding: theme.spacing(0, 3, 3),
    },
}))

interface Props extends PropsWithChildren<InjectedDialogProps> {
    confirmText?: string
    onConfirm?(): void
}

export const ConfirmModal: FC<Props> = ({ className, confirmText, onConfirm, children, ...rest }) => {
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
            <DialogContent className={classes.content}>{children}</DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
