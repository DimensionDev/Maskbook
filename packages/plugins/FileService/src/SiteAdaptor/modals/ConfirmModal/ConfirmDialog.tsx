import { memo, type ReactNode } from 'react'
import { Button, DialogContent, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog, type InjectedDialogProps } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 320,
        width: 320,
        minHeight: 280,
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontWeight: 700,
        marginTop: theme.spacing(3),
        color: theme.palette.maskColor.main,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        padding: theme.spacing(2),
        margin: theme.spacing(0),
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        margin: theme.spacing(1.5, 0),
        lineHeight: '20px',
        fontSize: 14,
        color: theme.palette.maskColor.second,
        wordBreak: 'break-all',
    },
    desc: {
        flexGrow: 1,
        fontSize: 14,
        textAlign: 'center',
        color: theme.palette.maskColor.second,
        marginBottom: theme.spacing(1),
    },
    closeButton: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.maskColor.main,
    },
}))

interface ConfirmDialogProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit'> {
    title?: string
    message?: ReactNode | string
    description?: ReactNode | string
    confirmLabel?: string
    onSubmit(): void
}

// Yet, another Confirm Dialog
export const ConfirmDialog = memo(
    ({ title, message, description, confirmLabel = 'Confirm', onSubmit, onClose, ...rest }: ConfirmDialogProps) => {
        const { classes } = useStyles()

        return (
            <InjectedDialog classes={{ paper: classes.paper, ...rest.classes }} {...rest}>
                <DialogContent className={classes.content}>
                    <Typography variant="h1" className={classes.title} component="div">
                        {title}
                    </Typography>
                    <Typography className={classes.message} component="div">
                        {message}
                    </Typography>
                    <Typography className={classes.desc} component="div">
                        {description}
                    </Typography>
                    <Button fullWidth color="error" onClick={() => onSubmit()}>
                        {confirmLabel}
                    </Button>
                    <Icons.Close className={classes.closeButton} size={24} onClick={onClose} />
                </DialogContent>
            </InjectedDialog>
        )
    },
)
