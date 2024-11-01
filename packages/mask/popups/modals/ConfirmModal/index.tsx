import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography, type TypographyProps } from '@mui/material'
import { useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'

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
    message: string
    disableConfirmButton?: boolean
    buttonLabel?: string
    onConfirm?(): void
    messageProps?: Partial<TypographyProps>
}

function ConfirmDrawer({
    message,
    buttonLabel,
    disableConfirmButton,
    onConfirm,
    messageProps,
    ...rest
}: ConfirmModalProps) {
    const { classes, cx } = useStyles()
    const t = useMaskSharedTrans()
    return (
        <BottomDrawer {...rest}>
            <Typography {...messageProps} className={cx(classes.message, messageProps?.className)}>
                {message}
            </Typography>
            {!disableConfirmButton ?
                <ActionButton className={classes.button} onClick={onConfirm}>
                    {buttonLabel || t.confirm()}
                </ActionButton>
            :   null}
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
