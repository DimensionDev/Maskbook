import { Button, DialogActions, DialogContent, dialogClasses } from '@mui/material'
import { InjectedDialog, useSharedI18N, type InjectedDialogProps } from '../../index.js'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles<number | undefined>()((theme, maxWidth) => ({
    dialog: {
        [`.${dialogClasses.paper}`]: {
            maxWidth,
        },
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        margin: theme.spacing(0),
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        margin: theme.spacing(1),
    },
}))

export interface ConfirmProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'content'> {
    open: boolean
    onClose: () => void

    title?: string
    confirmLabel?: React.ReactNode | string
    onSubmit?(result: boolean | null): void
    maxWidthOfContent?: number
    cancelText?: React.ReactNode | string
    confirmDisabled?: boolean
    maxWidth?: false | 'sm' | 'xs' | 'md' | 'lg' | 'xl'
}

export function Confirm({
    title,
    confirmLabel,
    children,
    onSubmit,
    maxWidthOfContent,
    maxWidth,
    cancelText,
    confirmDisabled,
    ...rest
}: ConfirmProps) {
    const t = useSharedI18N()
    const { classes } = useStyles(maxWidthOfContent)

    return (
        <InjectedDialog title={title ?? t.dialog_confirm()} maxWidth={maxWidth} className={classes.dialog} {...rest}>
            <DialogContent className={classes.content}>{children}</DialogContent>
            <DialogActions>
                cancelText ??
                <Button fullWidth className={classes.button} onClick={() => onSubmit?.(true)}>
                    {cancelText}
                </Button>
                <Button
                    fullWidth
                    className={classes.button}
                    onClick={() => onSubmit?.(true)}
                    disabled={confirmDisabled}>
                    {confirmLabel ?? t.dialog_confirm()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
