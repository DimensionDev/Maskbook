import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils/i18n-next-ui.js'

const useStyles = makeStyles()((theme) => ({
    message: {
        fontSize: 14,
        fontFamily: 'Helvetica',
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
    buttonLabel?: string
    onConfirm?(): void
}

function ConfirmDrawer({ message, buttonLabel, onConfirm, ...rest }: ConfirmModalProps) {
    const { classes } = useStyles()
    const { t } = useI18N()
    return (
        <BottomDrawer {...rest}>
            <Typography className={classes.message}>{message}</Typography>
            <ActionButton className={classes.button} onClick={onConfirm}>
                {buttonLabel || t('confirm')}
            </ActionButton>
        </BottomDrawer>
    )
}

export type ConfirmModalOpenProps = Omit<ConfirmModalProps, 'open'>
export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, boolean>>((_, ref) => {
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
})
