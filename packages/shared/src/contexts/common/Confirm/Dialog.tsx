import type { ReactNode } from 'react'
import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, dialogClasses } from '@mui/material'
import { useSharedI18N } from '../../../locales/index.js'
import { InjectedDialog, type InjectedDialogProps } from '../../components/index.js'

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

export interface ConfirmDialogProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'content'> {
    title?: string
    content: ReactNode | string
    confirmLabel?: string
    onSubmit?(result: boolean | null): void
    maxWidthOfContent?: number
}

export const ConfirmDialog = ({
    title,
    confirmLabel,
    content,
    onSubmit,
    maxWidthOfContent,
    ...rest
}: ConfirmDialogProps) => {
    const t = useSharedI18N()
    const { classes } = useStyles(maxWidthOfContent)

    return (
        <InjectedDialog title={title ?? t.dialog_confirm()} className={classes.dialog} {...rest}>
            <DialogContent className={classes.content}>{content}</DialogContent>
            <DialogActions>
                <Button fullWidth className={classes.button} onClick={() => onSubmit?.(true)}>
                    {confirmLabel ?? t.dialog_confirm()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
