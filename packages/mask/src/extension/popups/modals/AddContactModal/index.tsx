import { forwardRef, useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ActionButton, MaskTextField, makeStyles } from '@masknet/theme'
import { alpha } from '@mui/system'
import { buttonClasses } from '@mui/material/Button'
import type { SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EmojiAvatar } from '@masknet/shared'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { Typography } from '@mui/material'
import { Web3State } from '@masknet/web3-providers'
import { useContacts } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'

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
        fontSize: 32,
    },
    buttonGroup: {
        marginTop: theme.spacing(3),
        display: 'flex',
        columnGap: 12,
    },
    input: {
        marginTop: 12,
    },
    helperText: {
        color: theme.palette.maskColor.danger,
        marginTop: 12,
    },
}))

interface AddContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    setAddress(address: string): void
    setName(name: string): void
    address: string
    name: string
}

function AddContactDrawer({ onConfirm, address, name, setName, setAddress, ...rest }: AddContactModalProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const contacts = useContacts()

    const addressError = Boolean(address) && !isValidAddress(address)
    const nameAlreadyExist = Boolean(contacts?.find((contact) => contact.name === name))

    const validationMessage = useMemo(() => {
        if (addressError) return t('wallets_transfer_error_invalid_address')
        if (nameAlreadyExist) return t('wallets_transfer_contact_wallet_name_already_exist')
        return ''
    }, [t, addressError, nameAlreadyExist])

    const [{ loading }, addContact] = useAsyncFn(async () => {
        await Web3State.state.AddressBook?.addContact({ name, address })
        onConfirm?.()
    }, [name, address, onConfirm])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <MaskTextField
                spellCheck={false}
                placeholder={t('wallet_name_wallet')}
                className={classes.input}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                error={nameAlreadyExist}
            />
            <MaskTextField
                spellCheck={false}
                placeholder={t('address')}
                wrapperProps={{ className: classes.input }}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                error={addressError}
            />
            {validationMessage ? <Typography className={classes.helperText}>{validationMessage}</Typography> : null}
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton
                    loading={loading}
                    onClick={addContact}
                    className={classes.button}
                    disabled={addressError || nameAlreadyExist || !name}>
                    {t('confirm')}
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type AddContactModalOpenProps = Omit<AddContactModalProps, 'open' | 'setAddress' | 'setName'>
export const AddContactModal = forwardRef<SingletonModalRefCreator<AddContactModalOpenProps, boolean>>((_, ref) => {
    const [props, setProps] = useState<AddContactModalOpenProps>({
        title: '',
        address: '',
        name: '',
    })

    const setAddress = useCallback((address: string) => setProps({ ...props, address }), [props])

    const setName = useCallback((name: string) => setProps({ ...props, name }), [props])

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <AddContactDrawer
            open={open}
            {...props}
            setAddress={setAddress}
            setName={setName}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
})
