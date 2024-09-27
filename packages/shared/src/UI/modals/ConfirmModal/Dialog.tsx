import { makeStyles } from '@masknet/theme'
import { Button, DialogActions, DialogContent, dialogClasses } from '@mui/material'
import { InjectedDialog, type InjectedDialogProps } from '../../contexts/index.js'
import { Trans } from '@lingui/macro'

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

interface ConfirmProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit' | 'content'> {
    open: boolean
    title?: React.ReactNode
    confirmLabel?: React.ReactNode
    content: React.ReactNode
    maxWidthOfContent?: number
    onSubmit(): void
}

export function Confirm({ title, confirmLabel, content, onSubmit, maxWidthOfContent, ...rest }: ConfirmProps) {
    const { classes } = useStyles(maxWidthOfContent)

    return (
        <InjectedDialog title={title ?? <Trans>Confirm</Trans>} className={classes.dialog} {...rest}>
            <DialogContent className={classes.content}>{content}</DialogContent>
            <DialogActions>
                <Button fullWidth className={classes.button} onClick={() => onSubmit()}>
                    {confirmLabel ?? <Trans>Confirm</Trans>}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
