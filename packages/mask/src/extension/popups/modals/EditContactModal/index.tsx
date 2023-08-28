import { forwardRef, useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { ActionButton, MaskTextField, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { buttonClasses } from '@mui/material/Button'
import { alpha } from '@mui/system'
import { Box, Typography } from '@mui/material'
import { type SingletonModalRefCreator } from '@masknet/shared-base'
import { useSingletonModal } from '@masknet/shared-base-ui'
import { EmojiAvatar } from '@masknet/shared'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Web3, Web3State } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useContacts, useWallets } from '@masknet/web3-hooks-base'
import { BottomDrawer, type BottomDrawerProps } from '../../components/index.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { ContactType } from '../../pages/Wallet/type.js'

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
        background: 'transparent',
    },
    inputRoot: {
        background: 'transparent',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        height: 30,
        caretColor: theme.palette.maskColor.primary,
        border: 'none',
        outline: 'none',
        '&.Mui-focused': {
            border: 'none',
            outline: 'none',
        },
        '& .MuiInputBase-input': {
            textAlign: 'center',
        },
    },
    helperText: {
        color: theme.palette.maskColor.danger,
        marginTop: 12,
    },
    address: {
        textAlign: 'center',
        color: theme.palette.maskColor.second,
        marginTop: 12,
        fontSize: 16,
    },
    inputWrapper: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
    },
}))

interface EditContactModalProps extends BottomDrawerProps {
    onConfirm?(): void
    setName(name: string): void
    address: string
    name: string
    type: ContactType | undefined
}

function EditContactDrawer({ onConfirm, address, name, setName, type, ...rest }: EditContactModalProps) {
    const { classes, cx } = useStyles()
    const { t } = useI18N()

    const contacts = useContacts()
    const wallets = useWallets()

    const { showSnackbar } = usePopupCustomSnackbar()

    const nameAlreadyExist = Boolean(
        contacts?.find((contact) => contact.name === name && !isSameAddress(contact.address, address)) ||
            wallets?.find((wallet) => wallet.name === name),
    )

    const validationMessage = useMemo(() => {
        if (nameAlreadyExist) return t('wallets_transfer_contact_wallet_name_already_exist')
        return ''
    }, [t, nameAlreadyExist])

    const [{ loading }, edit] = useAsyncFn(async () => {
        const _name = name.trim()
        if (type === ContactType.Recipient) {
            await Web3State.state.AddressBook?.renameContact({ name: _name, address })
        } else if (type === ContactType.Owned) {
            await Web3.renameWallet?.(address, _name, { providerType: ProviderType.MaskWallet })
        }

        showSnackbar(t('wallet_edit_contact_successfully'))

        onConfirm?.()
    }, [name, address, type, onConfirm])

    return (
        <BottomDrawer {...rest}>
            <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 60, height: 60 }} />
            <Box className={classes.inputWrapper}>
                <MaskTextField
                    variant="standard"
                    inputProps={{ style: { textAlign: 'center' } }}
                    classes={{ root: classes.inputRoot }}
                    spellCheck={false}
                    placeholder={t('wallet_name_wallet')}
                    className={classes.input}
                    value={name}
                    onChange={(ev) => {
                        if (name.length > 18) return
                        setName(ev.target.value)
                    }}
                    error={nameAlreadyExist}
                />
            </Box>
            <Typography className={classes.address}>{formatEthereumAddress(address, 4)}</Typography>
            {validationMessage ? <Typography className={classes.helperText}>{validationMessage}</Typography> : null}
            <div className={classes.buttonGroup}>
                <ActionButton className={cx(classes.button, classes.secondaryButton)} onClick={rest.onClose}>
                    {t('cancel')}
                </ActionButton>
                <ActionButton
                    onClick={edit}
                    loading={loading}
                    className={classes.button}
                    disabled={nameAlreadyExist || !name.trim()}>
                    {t('confirm')}
                </ActionButton>
            </div>
        </BottomDrawer>
    )
}

export type EditContactModalOpenProps = Omit<EditContactModalProps, 'open' | 'setName'>
export const EditContactModal = forwardRef<SingletonModalRefCreator<EditContactModalOpenProps, boolean>>((_, ref) => {
    const [props, setProps] = useState<EditContactModalOpenProps>({
        title: '',
        address: '',
        name: '',
        type: undefined,
    })

    const setName = useCallback((name: string) => setProps({ ...props, name }), [props])

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen(p) {
            setProps(p)
        },
    })
    return (
        <EditContactDrawer
            open={open}
            {...props}
            setName={setName}
            onClose={() => dispatch?.close(false)}
            onConfirm={() => dispatch?.close(true)}
        />
    )
})
