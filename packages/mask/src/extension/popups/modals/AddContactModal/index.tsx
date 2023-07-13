import { ActionButton, MaskTextField, makeStyles } from '@masknet/theme'
import { forwardRef, useState } from 'react'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { buttonClasses } from '@mui/material/Button'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { EmojiAvatar } from '@masknet/shared'
import { alpha } from '@mui/system'

const useStyles = makeStyles()((theme) => ({
    button: {
        flex: 1,
    },
    secondaryButton: {
        backgroundColor: theme.palette.maskColor.thirdMain,
        color: theme.palette.maskColor.main,
        border: 'none!important',
        ['&:hover']: {
            background: theme.palette.maskColor.thirdMain,
            boxShadow: `0px 8px 25px ${alpha(theme.palette.maskColor.thirdMain, 0.1)}`,
            border: 'none',
        },
        [`&.${buttonClasses.disabled}`]: {
            color: theme.palette.maskColor.main,
            background: theme.palette.maskColor.thirdMain,
            opacity: 0.4,
        },
    },
    emojiAvatar: {
        margin: '28px auto 12px',
    },
    buttonGroup: {
        marginTop: theme.spacing(2),
        display: 'flex',
        columnGap: 12,
    },
    input: {
        marginTop: 12,
    },
}))

interface AddContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    address: string
    ensName: string
}

function AddContactDrawer({ onConfirm, address, ensName, ...rest }: AddContactModalProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()
    const [contactAddress, setContactAddress] = useState('')
    const [name, setName] = useState('')

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <MaskTextField
                placeholder="Name"
                className={classes.input}
                value={name || ensName}
                onChange={(ev) => setName(ev.target.value)}
            />
            <MaskTextField
                placeholder="Address"
                wrapperProps={{ className: classes.input }}
                value={contactAddress || address}
                onChange={(ev) => setContactAddress(ev.target.value)}
            />
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton onClick={onConfirm} className={classes.button}>
                    {t('confirm')}
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type AddContactModalOpenProps = Omit<AddContactModalProps, 'open'>
export const AddContactModal = forwardRef<SingletonModalRefCreator<AddContactModalOpenProps, boolean>>((_, ref) => {
    const [props, setProps] = useState<AddContactModalOpenProps>({
        title: '',
        address: '',
        ensName: '',
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
