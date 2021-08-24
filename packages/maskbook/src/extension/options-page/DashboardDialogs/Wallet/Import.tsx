import { useCallback, useState } from 'react'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { WALLET_OR_PERSONA_NAME_MAX_LEN, useI18N, checkInputLengthExceed } from '../../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import AbstractTab, { AbstractTabProps } from '../../../../components/shared/AbstractTab'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'
import type { FC } from 'react'
import { useWalletHD } from '../../../../plugins/Wallet/hooks/useWalletHD'

const useWalletImportDialogStyle = makeStyles()((theme) => ({
    wrapper: {
        width: 550,
    },
    confirmation: {
        fontSize: 16,
        lineHeight: 1.75,
        [theme.breakpoints.down('sm')]: { fontSize: 14 },
    },
    notification: {
        fontSize: 12,
        fontWeight: 500,
        textAlign: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? '#17191D' : '#EFF5FF',
        padding: '8px 22px',
        margin: theme.spacing(1, 0, 0),
        borderRadius: '4px',
    },
    notificationIcon: {
        width: 16,
        height: 16,
        color: theme.palette.primary.main,
    },
}))

export function DashboardWalletImportDialog(props: WrappedDialogProps<object>) {
    const { t } = useI18N()
    const state = useState(0)
    const { classes } = useWalletImportDialogStyle()
    const hdWallet = useWalletHD()

    // wallet name
    const [walletName, setWalletName] = useState('')
    // mnemonic
    const [mnemonic, setMnemonic] = useState('')
    // private key
    const [privateKey, setPrivateKey] = useState('')
    // new wallet
    const [confirmed, setConfirmed] = useState(false)
    const [showNotification, setShowNotification] = useState(false)
    // keystore
    const [keystoreContent, setKeystoreContent] = useState('')
    const [keystorePassword, setKeystorePassword] = useState('')

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_new'),
                children: (
                    <>
                        <WalletName name={walletName} onChange={setWalletName} />
                        <br />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={confirmed}
                                        onChange={() => setConfirmed((confirmed) => !confirmed)}
                                    />
                                }
                                label={
                                    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                                        <Typography className={classes.confirmation} variant="body2">
                                            {t('wallet_confirmation_hint')}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <InfoOutlinedIcon
                                className={classes.notificationIcon}
                                cursor="pointer"
                                onClick={(ev) => {
                                    ev.stopPropagation()
                                    setShowNotification((t) => !t)
                                }}
                            />
                        </Box>
                        {showNotification ? (
                            <Typography className={classes.notification}>{t('wallet_notification')}</Typography>
                        ) : null}
                    </>
                ),
            },
            {
                label: t('wallet_import_keystore_label'),
                children: (
                    <div>
                        <WalletName name={walletName} onChange={setWalletName} />
                        <TextField
                            required
                            multiline={true}
                            rows={6}
                            variant="outlined"
                            label={t('wallet_import_keystore_content_label')}
                            placeholder={t('wallet_import_keystore_content_placeholder')}
                            value={keystoreContent}
                            onChange={(e) => setKeystoreContent(e.target.value)}
                        />
                        <TextField
                            required
                            type="password"
                            variant="outlined"
                            label={t('wallet_import_keystore_password_label')}
                            placeholder={t('wallet_import_keystore_password_placeholder')}
                            value={keystorePassword}
                            onChange={(e) => setKeystorePassword(e.target.value)}
                        />
                    </div>
                ),
            },
            {
                label: t('mnemonic_words'),
                children: (
                    <div>
                        <WalletName name={walletName} onChange={setWalletName} />
                        <TextField
                            required
                            label={t('mnemonic_words')}
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                            variant="outlined"
                        />
                    </div>
                ),
                sx: { p: 0 },
            },
            {
                label: t('private_key'),
                children: (
                    <div>
                        <WalletName name={walletName} onChange={setWalletName} />
                        <TextField
                            type="password"
                            required
                            label={t('private_key')}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            variant="outlined"
                        />
                    </div>
                ),
                sx: { display: 'flex', p: 0 },
            },
        ],
        state,
        height: 'auto',
    }

    const { setDialog: setCreateWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.createWalletDialogUpdated,
    )

    const onCreate = useCallback(
        (name: string) => {
            if (hdWallet) return
            setCreateWalletDialog({
                open: true,
                name,
            })
        },
        [hdWallet?.address, setCreateWalletDialog],
    )
    const onDeriveOrImport = useSnackbarCallback(
        async () => {
            switch (state[0]) {
                case 0: {
                    if (!hdWallet) return
                    await WalletRPC.deriveWalletFromPhrase(walletName, hdWallet.mnemonic, hdWallet.passphrase)
                    break
                }
                case 1: {
                    const { address, privateKey: _private_key_ } = await WalletRPC.fromKeyStore(
                        keystoreContent,
                        Buffer.from(keystorePassword, 'utf-8'),
                    )
                    await WalletRPC.importNewWallet({
                        name: walletName,
                        address,
                        _private_key_,
                    })
                    break
                }
                case 2: {
                    const words = mnemonic.split(' ')
                    if (words.length !== 12) {
                        throw new Error(t('import_failed'))
                    }
                    await WalletRPC.importNewWallet({
                        name: walletName,
                        path: `${HD_PATH_WITHOUT_INDEX_ETHEREUM}/0`,
                        mnemonic: words,
                        passphrase: '',
                    })
                    await WalletRPC.addPhrase({
                        path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                        mnemonic: words,
                        passphrase: '',
                    })
                    break
                }
                case 3: {
                    const { address, privateKeyValid } = await WalletRPC.recoverWalletFromPrivateKey(privateKey)
                    if (!privateKeyValid) throw new Error(t('import_failed'))
                    await WalletRPC.importNewWallet({
                        name: walletName,
                        address,
                        _private_key_: privateKey,
                    })
                    break
                }
                default:
                    break
            }
        },
        [state[0], walletName, mnemonic, privateKey, hdWallet?.address],
        props.onClose,
    )
    const onSubmit = useCallback(async () => {
        if (state[0] !== 0 || hdWallet) {
            await onDeriveOrImport()
            return
        }
        props.onClose()
        onCreate(walletName)
    }, [state[0], walletName, hdWallet?.address, onCreate, onDeriveOrImport])

    const formInvalid = (() => {
        if (walletName.length === 0 || checkInputLengthExceed(walletName)) {
            return true
        }
        const isFilled =
            (state[0] === 0 && confirmed) ||
            (state[0] === 1 && keystoreContent && keystorePassword) ||
            (state[0] === 2 && mnemonic) ||
            (state[0] === 3 && privateKey)
        return !isFilled
    })()

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                classes={classes}
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t(state[0] === 0 ? 'plugin_wallet_on_create' : 'import_wallet')}
                content={<AbstractTab {...tabProps} />}
                footer={
                    <DebounceButton variant="contained" onClick={onSubmit} disabled={formInvalid}>
                        {t(state[0] === 0 ? 'create' : 'import')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}

const WalletName: FC<{ name: string; onChange(name: string): void }> = ({ name, onChange }) => {
    const { t } = useI18N()
    const text = checkInputLengthExceed(name)
        ? t('input_length_exceed_prompt', {
              name: t('wallet_name').toLowerCase(),
              length: WALLET_OR_PERSONA_NAME_MAX_LEN,
          })
        : undefined
    return (
        <TextField
            helperText={text}
            required
            autoFocus
            label={t('wallet_name')}
            value={name}
            onChange={(e) => onChange(e.target.value)}
            variant="outlined"
        />
    )
}
