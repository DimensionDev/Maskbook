import { Box, Checkbox, FormControlLabel, makeStyles, TextField, Theme, Typography } from '@material-ui/core'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import { useCallback, useState } from 'react'
import { CreditCard as CreditCardIcon } from 'react-feather'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '../../../../plugins/Wallet/constants'
import { useWalletHD } from '../../../../plugins/Wallet/hooks/useWallet'
import { WalletMessages, WalletRPC } from '../../../../plugins/Wallet/messages'
import { WALLET_OR_PERSONA_NAME_MAX_LEN } from '../../../../utils/constants'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { checkInputLengthExceed } from '../../../../utils/utils'
import AbstractTab, { AbstractTabProps } from '../../DashboardComponents/AbstractTab'
import { DebounceButton } from '../../DashboardComponents/ActionButton'
import { DashboardDialogCore, DashboardDialogWrapper, useSnackbarCallback, WrappedDialogProps } from '../Base'

const useWalletImportDialogStyle = makeStyles((theme: Theme) => ({
    confirmation: {
        fontSize: 16,
        lineHeight: 1.75,
        [theme.breakpoints.down('sm')]: {
            fontSize: 14,
        },
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
    const classes = useWalletImportDialogStyle()

    const hdWallet = useWalletHD()

    const [name, setName] = useState('')
    const [passphrase] = useState('')
    const [mnemonic, setMnemonic] = useState('')
    const [privKey, setPrivKey] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [showNotification, setShowNotification] = useState(false)

    const tabProps: AbstractTabProps = {
        tabs: [
            {
                label: t('wallet_new'),
                children: (
                    <>
                        <form>
                            <TextField
                                helperText={
                                    checkInputLengthExceed(name)
                                        ? t('input_length_exceed_prompt', {
                                              name: t('wallet_name').toLowerCase(),
                                              length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                          })
                                        : undefined
                                }
                                required
                                autoFocus
                                label={t('wallet_name')}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                variant="outlined"
                            />
                        </form>
                        <br />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={confirmed}
                                        onChange={() => setConfirmed((confirmed) => !confirmed)}
                                    />
                                }
                                label={
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                        }}>
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
                label: t('mnemonic_words'),
                children: (
                    <div>
                        <TextField
                            helperText={
                                checkInputLengthExceed(name)
                                    ? t('input_length_exceed_prompt', {
                                          name: t('wallet_name').toLowerCase(),
                                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                      })
                                    : undefined
                            }
                            required
                            autoFocus
                            label={t('wallet_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
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
                        <TextField
                            helperText={
                                checkInputLengthExceed(name)
                                    ? t('input_length_exceed_prompt', {
                                          name: t('wallet_name').toLowerCase(),
                                          length: WALLET_OR_PERSONA_NAME_MAX_LEN,
                                      })
                                    : undefined
                            }
                            required
                            autoFocus
                            label={t('wallet_name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            variant="outlined"
                        />
                        <TextField
                            type="password"
                            required
                            label={t('private_key')}
                            value={privKey}
                            onChange={(e) => setPrivKey(e.target.value)}
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
                case 0:
                    if (!hdWallet) return
                    await WalletRPC.deriveWalletFromPhrase(name, hdWallet.mnemonic, hdWallet.passphrase)
                    break
                case 1:
                    const words = mnemonic.split(' ')
                    await WalletRPC.importNewWallet({
                        name,
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
                case 2:
                    const { address, privateKeyValid } = await WalletRPC.recoverWalletFromPrivateKey(privKey)
                    if (!privateKeyValid) throw new Error(t('import_failed'))
                    await WalletRPC.importNewWallet({
                        name,
                        address,
                        _private_key_: privKey,
                    })
                    break
                default:
                    break
            }
        },
        [state[0], name, passphrase, mnemonic, privKey, hdWallet?.address],
        props.onClose,
    )
    const onSubmit = useCallback(async () => {
        if (state[0] !== 0 || hdWallet) {
            await onDeriveOrImport()
            return
        }
        props.onClose()
        onCreate(name)
    }, [state[0], name, hdWallet?.address, onCreate, onDeriveOrImport])

    return (
        <DashboardDialogCore {...props}>
            <DashboardDialogWrapper
                icon={<CreditCardIcon />}
                iconColor="#4EE0BC"
                primary={t(state[0] === 0 ? 'plugin_wallet_on_create' : 'import_wallet')}
                content={<AbstractTab {...tabProps}></AbstractTab>}
                footer={
                    <DebounceButton
                        variant="contained"
                        onClick={onSubmit}
                        disabled={
                            (!(state[0] === 0 && name && confirmed) &&
                                !(state[0] === 1 && name && mnemonic) &&
                                !(state[0] === 2 && name && privKey)) ||
                            checkInputLengthExceed(name)
                        }>
                        {t(state[0] === 0 ? 'create' : 'import')}
                    </DebounceButton>
                }
            />
        </DashboardDialogCore>
    )
}
