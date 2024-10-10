import { memo, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { first } from 'lodash-es'
import { useContainer } from '@masknet/shared-base-ui'
import { Icons } from '@masknet/icons'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { Box, Button, Link, Typography, useTheme } from '@mui/material'
import { isSameAddress } from '@masknet/web3-shared-base'
import { PopupRoutes, type PersonaInformation, type Wallet, PopupModalRoutes } from '@masknet/shared-base'
import { useWallet, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, MaskWalletProvider, EVMWeb3 } from '@masknet/web3-providers'
import { type ChainId, ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useMaskSharedTrans, UserContext } from '../../../../shared-ui/index.js'
import Services from '#services'
import { useTitle, PopupContext, useHasPassword } from '../../../hooks/index.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { useModalNavigate } from '../../../components/index.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    infoBox: {
        background: theme.palette.maskColor.modalTitleBg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        display: 'flex',
        alignItems: 'center',
        columnGap: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
    },
    wallets: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        columnGap: theme.spacing(1.5),
    },
    tips: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.maskColor.danger,
        margin: theme.spacing(2, 0),
        wordWrap: 'break-word',
    },
}))

export const Component = memo(function Logout() {
    const { currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const wallet = useWallet()
    const wallets = useWallets()
    const { Provider } = useWeb3State()
    const { smartPayChainId } = useContainer(PopupContext)
    const { hasPassword, isPending: hasPasswordLoading } = useHasPassword()

    const { user } = useContainer(UserContext)
    const { showSnackbar } = usePopupCustomSnackbar()

    const manageWallets = useMemo(() => {
        return wallets.filter((x) => isSameAddress(x.owner, currentPersona?.address))
    }, [wallets, currentPersona])

    const [{ loading }, onLogout] = useAsyncFn(async () => {
        try {
            if (!currentPersona) return
            if (currentPersona.address) {
                if (isSameAddress(currentPersona.address, wallet?.owner)) {
                    const newWallet = first(wallets)
                    await EVMWeb3.connect({
                        account: newWallet?.address,
                        chainId: newWallet?.owner ? smartPayChainId : undefined,
                        providerType: ProviderType.MaskWallet,
                    })
                }

                if (manageWallets.length) {
                    await MaskWalletProvider?.removeWallets(manageWallets)
                }
            }
            await Services.Identity.logoutPersona(currentPersona.identifier)
            const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
            if (!currentPersonaIdentifier) {
                const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
                await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona)
            }

            showSnackbar(<Trans>Logout successfully</Trans>)
            navigate(PopupRoutes.Personas, { replace: true })
        } catch {
            showSnackbar(<Trans>Logout failed</Trans>, { variant: 'error' })
        }
    }, [currentPersona, Provider, wallet, wallets, smartPayChainId, manageWallets.length])

    return (
        <LogoutUI
            chainId={smartPayChainId}
            manageWallets={manageWallets}
            currentPersona={currentPersona}
            backupPassword={user.backupPassword ?? ''}
            verifyPaymentPassword={Services.Wallet.verifyPassword}
            loading={loading || hasPasswordLoading}
            hasPassword={hasPassword}
            onLogout={onLogout}
            onCancel={() => navigate(-1)}
        />
    )
})

interface LogoutUIProps {
    chainId?: ChainId
    manageWallets: Wallet[]
    currentPersona?: PersonaInformation
    verifyPaymentPassword: (password: string) => Promise<boolean>
    backupPassword: string
    loading: boolean
    hasPassword?: boolean
    onCancel: () => void
    onLogout: () => void
}

const LogoutUI = memo<LogoutUIProps>(
    ({
        backupPassword,
        loading,
        onLogout,
        hasPassword,
        onCancel,
        currentPersona,
        manageWallets,
        verifyPaymentPassword,
        chainId,
    }) => {
        const { _ } = useLingui()
        const t = useMaskSharedTrans()
        const theme = useTheme()
        const modalNavigate = useModalNavigate()
        const { classes } = useStyles()
        const [password, setPassword] = useState('')
        const [paymentPassword, setPaymentPassword] = useState('')
        const [error, setError] = useState(false)
        const [paymentPasswordError, setPaymentPasswordError] = useState<ReactNode>('')

        useTitle(_(msg`Log out`))

        const onConfirm = useCallback(async () => {
            if (manageWallets.length) {
                if (hasPassword) {
                    const verified = await verifyPaymentPassword(paymentPassword)
                    if (!verified) {
                        setPaymentPasswordError(<Trans>Incorrect payment password.</Trans>)
                        return
                    }
                } else if (!backupPassword) {
                    modalNavigate(PopupModalRoutes.SetBackupPassword, { to: PopupRoutes.ExportPrivateKey })
                    return
                }
            }
            if (backupPassword && backupPassword !== password) {
                setError(true)
                return
            }

            onLogout()
            return
        }, [onLogout, backupPassword, password, paymentPassword, manageWallets.length, hasPassword])

        const disabled = useMemo(() => {
            if (loading || error || paymentPasswordError) return true
            if (manageWallets.length) {
                if (hasPassword) return !paymentPassword.length
                if (!backupPassword) return false
            }
            if (backupPassword) return !password.length
            return false
        }, [
            loading,
            manageWallets,
            backupPassword,
            hasPassword,
            error,
            paymentPasswordError,
            paymentPassword,
            password,
        ])

        const passwordField = useMemo(() => {
            if (manageWallets.length) {
                if (hasPassword) {
                    return (
                        <PasswordField
                            placeholder={_(msg`Please enter your payment password.`)}
                            value={paymentPassword}
                            error={!!paymentPasswordError}
                            helperText={paymentPasswordError}
                            onChange={(e) => {
                                if (paymentPasswordError) setPaymentPasswordError('')
                                setPaymentPassword(e.target.value)
                            }}
                        />
                    )
                } else if (backupPassword) {
                    return (
                        <PasswordField
                            placeholder={_(msg`Please enter your backup password.`)}
                            value={password}
                            onChange={(e) => {
                                if (error) setError(false)
                                setPassword(e.target.value)
                            }}
                            error={error}
                            helperText={error ? <Trans>Incorrect password</Trans> : ''}
                        />
                    )
                }

                return
            }

            if (backupPassword) {
                return (
                    <PasswordField
                        placeholder={_(msg`Please enter your backup password.`)}
                        value={password}
                        onChange={(e) => {
                            if (error) setError(false)
                            setPassword(e.target.value)
                        }}
                        error={error}
                        helperText={error ? <Trans>Incorrect password</Trans> : ''}
                    />
                )
            }

            return
        }, [manageWallets, hasPassword, paymentPassword, paymentPasswordError, backupPassword, password, error, t])

        return (
            <Box flex={1} maxHeight="544px" overflow="auto" data-hide-scrollbar>
                <Box p={2} pb={11}>
                    <Box className={classes.infoBox}>
                        <PersonaAvatar
                            size={30}
                            avatar={currentPersona?.avatar}
                            pubkey={currentPersona?.identifier.publicKeyAsHex || ''}
                        />
                        <Box>
                            <Typography fontWeight={700}>{currentPersona?.nickname}</Typography>
                            <Typography fontSize={10} color={theme.palette.maskColor.third} lineHeight="10px">
                                {currentPersona?.identifier.rawPublicKey}
                            </Typography>
                        </Box>
                    </Box>
                    {manageWallets.length ?
                        <Box className={classes.wallets}>
                            {manageWallets.map((x, index) => (
                                <Box className={classes.infoBox} key={index}>
                                    <Icons.SmartPay size={30} />
                                    <Box>
                                        <Typography fontWeight={700}>{x.name}</Typography>
                                        <Typography
                                            marginTop={0.5}
                                            color={theme.palette.maskColor.second}
                                            fontWeight={700}
                                            fontSize={10}
                                            lineHeight="10px"
                                            display="flex"
                                            alignItems="center">
                                            {formatEthereumAddress(x.address, 4)}
                                            {chainId ?
                                                <Link
                                                    style={{
                                                        width: 12,
                                                        height: 12,
                                                        color: theme.palette.maskColor.main,
                                                        display: 'flex',
                                                        marginLeft: 4,
                                                    }}
                                                    href={EVMExplorerResolver.addressLink(chainId, x.address)}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    <Icons.LinkOut size={12} />
                                                </Link>
                                            :   null}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    :   null}
                    <Typography className={classes.tips}>
                        <Trans>
                            After logging out, your associated social accounts will no longer decrypt old encrypted
                            messages. If you need to use your account again, you can recover your account with your
                            identity, private key, local or cloud backup.
                        </Trans>
                        {currentPersona && manageWallets.length ?
                            <Typography mt={2}>
                                {t.popups_log_out_with_smart_pay_tips({
                                    persona: currentPersona.nickname || '',
                                    count: manageWallets.length,
                                })}
                            </Typography>
                        :   null}
                    </Typography>
                    {passwordField}
                </Box>
                <BottomController>
                    <Button variant="outlined" fullWidth onClick={onCancel}>
                        <Trans>Cancel</Trans>
                    </Button>
                    <ActionButton
                        variant="contained"
                        color={!backupPassword && manageWallets.length && !hasPassword ? 'primary' : 'error'}
                        fullWidth
                        onClick={onConfirm}
                        disabled={disabled}>
                        {!backupPassword && manageWallets.length && !hasPassword ?
                            <Trans>Backup</Trans>
                        :   <Trans>Log out</Trans>}
                    </ActionButton>
                </BottomController>
            </Box>
        )
    },
)
