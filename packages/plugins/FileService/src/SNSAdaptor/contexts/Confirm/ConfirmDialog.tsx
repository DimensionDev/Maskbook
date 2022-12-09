import { Icons } from '@masknet/icons'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { Button, DialogContent, Typography } from '@mui/material'
import { FC, memo, ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 320,
        width: 320,
        minHeight: 280,
        height: 280,
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
        color: theme.palette.maskColor.second,
    },
    desc: {
        flexGrow: 1,
        textAlign: 'center',
        color: theme.palette.maskColor.second,
    },
    closeButton: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.maskColor.main,
    },
}))

export interface ConfirmDialogProps extends Omit<InjectedDialogProps, 'title' | 'onSubmit'> {
    title?: string
    message?: ReactNode | string
    description?: ReactNode | string
    confirmLabel?: string
    onSubmit?(result: boolean | null): void
}

export const ConfirmDialog: FC<ConfirmDialogProps> = memo(
    ({ title, message, description, confirmLabel = 'Confirm', onSubmit, onClose, ...rest }) => {
        const { classes } = useStyles()

        return (
            <InjectedDialog classes={{ paper: classes.paper, ...rest.classes }} {...rest}>
                <DialogContent className={classes.content}>
                    <Typography variant="h1" className={classes.title}>
                        {title}
                    </Typography>
                    <Typography className={classes.message}>{message}</Typography>
                    <Typography className={classes.desc}>{description}</Typography>
                    <Button fullWidth color="error" onClick={() => onSubmit?.(true)}>
                        {confirmLabel}
                    </Button>
                    <Icons.Close className={classes.closeButton} size={24} onClick={onClose} />
                </DialogContent>
            </InjectedDialog>
        )
    },
)
