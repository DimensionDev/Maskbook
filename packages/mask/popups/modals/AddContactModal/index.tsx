import { useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ActionButton, MaskTextField, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { alpha } from '@mui/system'
import { buttonClasses } from '@mui/material/Button'
import type { SingletonModalProps } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EmojiAvatar } from '@masknet/shared'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { IconButton, InputAdornment, Typography, useTheme } from '@mui/material'
import { evm } from '@masknet/web3-providers'
import { useContacts, useWallets } from '@masknet/web3-hooks-base'
import { useMaskSharedTrans } from '../../../shared-ui/index.js'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Icons } from '@masknet/icons'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const { classes, cx } = useStyles()
    const t = useMaskSharedTrans()
    const theme = useTheme()

    const contacts = useContacts()
    const wallets = useWallets()

    const { showSnackbar } = usePopupCustomSnackbar()

    const addressError = Boolean(address) && !isValidAddress(address)
    const nameExistError = Boolean(
        contacts?.find((contact) => contact.name === name) || wallets.find((wallet) => wallet.name === name),
    )
    const addressExistError = useMemo(
        () => contacts.some((contact) => isSameAddress(address, contact.address)),
        [contacts, address],
    )

    const [{ loading }, addContact] = useAsyncFn(async () => {
        await evm.state!.AddressBook?.addContact({ name, address })
        showSnackbar(<Trans>Contact added.</Trans>)
        onConfirm?.()
    }, [name, address, onConfirm, t])

    const validationMessage = useMemo(() => {
        if (addressError) return <Trans>Incorrect wallet address.</Trans>
        if (nameExistError) return <Trans>The wallet name already exists.</Trans>
        if (addressExistError) return <Trans>The wallet address already exists.</Trans>
        return ''
    }, [t, addressError, nameExistError, addressExistError])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar value={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <MaskTextField
                spellCheck={false}
                placeholder={_(msg`Name`)}
                className={classes.input}
                value={name}
                onChange={(ev) => {
                    if (name.length > 18) return
                    setName(ev.target.value)
                }}
                error={nameExistError}
                autoFocus
            />
            <MaskTextField
                spellCheck={false}
                placeholder={_(msg`Address`)}
                wrapperProps={{ className: classes.input }}
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                error={addressError || addressExistError}
                InputProps={{
                    endAdornment:
                        addressError || addressExistError ?
                            <InputAdornment position="end">
                                <IconButton onClick={() => setAddress('')} edge="end" size="small">
                                    <Icons.Close size={18} color={theme.palette.maskColor.danger} />
                                </IconButton>
                            </InputAdornment>
                        :   null,
                }}
            />
            {validationMessage ?
                <Typography className={classes.helperText}>{validationMessage}</Typography>
            :   null}
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    <Trans>Cancel</Trans>
                </ActionButton>
                <ActionButton
                    loading={loading}
                    onClick={addContact}
                    className={classes.button}
                    disabled={addressError || nameExistError || addressExistError || !name.trim() || !address}>
                    <Trans>Confirm</Trans>
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type AddContactModalOpenProps = Omit<AddContactModalProps, 'open' | 'setAddress' | 'setName'>
export function AddContactModal({ ref }: SingletonModalProps<AddContactModalOpenProps, boolean>) {
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
}
