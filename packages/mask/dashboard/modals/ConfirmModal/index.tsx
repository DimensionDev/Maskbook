import { InjectedDialog, useSharedTrans } from '@masknet/shared'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { type ActionButtonProps, makeStyles, ActionButton } from '@masknet/theme'
import { DialogContent, Typography, type DialogProps, Box } from '@mui/material'
import { noop } from 'lodash-es'
import { memo, useState, type ReactNode } from 'react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        minWidth: 320,
        width: 320,
        minHeight: 280,
    },
    title: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        textAlign: 'center',
    },
    message: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(0),
        lineHeight: '20px',
        fontSize: 14,
        color: theme.palette.maskColor.second,
        textAlign: 'center',
    },
    buttonGroup: {
        width: '100%',
        display: 'flex',
        gap: theme.spacing(2),
        flexDirection: 'column',
        marginTop: theme.spacing(4),
    },
}))

interface ConfirmDialogProps extends Omit<DialogProps, 'title' | 'onSubmit' | 'onClose'> {
    title?: ReactNode
    message?: ReactNode
    cancelLabel?: ReactNode
    confirmLabel?: ReactNode
    confirmButtonProps?: ActionButtonProps
    cancelButtonProps?: ActionButtonProps
    onConfirm(): void
    onClose?(): void
}

const Dialog = memo<ConfirmDialogProps>(
    ({
        title,
        message,
        cancelLabel,
        confirmLabel,
        confirmButtonProps,
        cancelButtonProps,
        onConfirm,
        onClose,
        ...rest
    }) => {
        const t = useSharedTrans()
        const { classes } = useStyles()
        return (
            <InjectedDialog classes={{ paper: classes.paper, ...rest.classes }} {...rest}>
                <DialogContent>
                    <Typography className={classes.title} variant="h1">
                        {title}
                    </Typography>
                    <Typography className={classes.message} component="div">
                        {message}
                    </Typography>
                    <Box className={classes.buttonGroup}>
                        <ActionButton
                            fullWidth
                            variant="roundedContained"
                            onClick={() => onConfirm()}
                            {...confirmButtonProps}>
                            {confirmLabel ?? t.confirm()}
                        </ActionButton>
                        <ActionButton
                            fullWidth
                            variant="roundedOutlined"
                            onClick={() => onClose?.()}
                            {...cancelButtonProps}>
                            {cancelLabel ?? t.cancel()}
                        </ActionButton>
                    </Box>
                </DialogContent>
            </InjectedDialog>
        )
    },
)
export type ConfirmDialogOpenProps = Omit<ConfirmDialogProps, 'open'>
export function ConfirmDialog({ ref }: SingletonModalProps<ConfirmDialogOpenProps, boolean>) {
    const [props, setProps] = useState<ConfirmDialogOpenProps>({
        title: '',
        message: '',
        onConfirm: noop,
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return <Dialog open={open} {...props} onClose={() => dispatch?.close(false)} onConfirm={props.onConfirm} />
}
