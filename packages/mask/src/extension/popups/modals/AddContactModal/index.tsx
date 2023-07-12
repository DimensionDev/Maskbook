import { ActionButton, makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { EmojiAvatar } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    button: {
        flex: 1,
    },
    secondaryButton: {},
    buttonGroup: {
        marginTop: theme.spacing(2),
        display: 'flex',
        columnGap: 12,
    },
}))

interface AddContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
}

function AddContactDrawer({ onConfirm, ...rest }: AddContactModalProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    return (
        <BottomDrawer {...rest}>
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton onClick={onConfirm}>{t('confirm')}</ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type AddContactModalOpenProps = Omit<AddContactModalProps, 'open'>
export const AddContactModal = forwardRef<SingletonModalRefCreator<AddContactModalOpenProps, boolean>>((_, ref) => {
    const [props, setProps] = useState<AddContactModalOpenProps>({
        title: '',
    })

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <AddContactDrawer
            open={open}
            {...props}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
})
