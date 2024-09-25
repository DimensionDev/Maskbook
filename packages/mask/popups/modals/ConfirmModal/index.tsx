import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useState, type ReactNode } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    message: {
        fontSize: 14,
        color: theme.palette.maskColor.third,
        fontWeight: 700,
        lineHeight: '18px',
        padding: theme.spacing(1.5, 0, 2),
        textAlign: 'center',
    },
    button: {
        marginTop: theme.spacing(2),
    },
}))

interface ConfirmModalProps extends BottomDrawerProps {
    message: ReactNode
    buttonLabel?: ReactNode
    onConfirm?(): void
}

function ConfirmDrawer({ message, buttonLabel, onConfirm, ...rest }: ConfirmModalProps) {
    const { classes } = useStyles()
    return (
        <BottomDrawer {...rest}>
            <Typography className={classes.message}>{message}</Typography>
            <ActionButton className={classes.button} onClick={onConfirm}>
                {buttonLabel || <Trans>Confirm</Trans>}
            </ActionButton>
        </BottomDrawer>
    )
}

export type ConfirmModalOpenProps = Omit<ConfirmModalProps, 'open'>
export function ConfirmModal({ ref }: SingletonModalProps<ConfirmModalOpenProps, boolean>) {
    const [props, setProps] = useState<ConfirmModalOpenProps>({
        title: '',
        message: '',
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <ConfirmDrawer
            open={open}
            {...props}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
}
