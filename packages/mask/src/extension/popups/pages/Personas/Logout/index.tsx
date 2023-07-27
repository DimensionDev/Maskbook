import { memo, useCallback, useMemo, useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { first } from 'lodash-es'
import { useContainer } from 'unstated-next'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { PersonaContext } from '@masknet/shared'
import { Box, Button, Link, Typography, useTheme } from '@mui/material'
import { isSameAddress } from '@masknet/web3-shared-base'
import { PopupRoutes, type PersonaInformation, NetworkPluginID, type Wallet } from '@masknet/shared-base'
import { useWallet, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { Providers, Web3 } from '@masknet/web3-providers'
import { type ChainId, ProviderType, explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils/index.js'
import Services from '../../../../service.js'
import { useTitle } from '../../../hook/useTitle.js'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { PersonaAvatar } from '../../../components/PersonaAvatar/index.js'
import { Icons } from '@masknet/icons'
import { Trans } from 'react-i18next'
import { useHasPassword } from '../../../hook/useHasPassword.js'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { UserContext } from '../../../hook/useUserContext.js'

const useStyles = makeStyles()((theme) => ({
    infoBox: {
        background: theme.palette.maskColor.modalTitleBg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
        display: 'flex',
        columnGap: theme.spacing(1),
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
        marginTop: theme.spacing(2),
        wordWrap: 'break-word',
    },
}))

const Logout = memo(() => {
    const { t } = useI18N()
    const { currentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const wallet = useWallet()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { Provider } = useWeb3State()
    const { smartPayChainId } = useContainer(PopupContext)
    const { hasPassword, loading: getHasPasswordLoading } = useHasPassword()

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
                    await Web3.connect({
                        account: newWallet?.address,
                        chainId: newWallet?.owner ? smartPayChainId : undefined,
                        providerType: ProviderType.MaskWallet,
                    })
                }

                if (manageWallets.length) {
                    const maskProvider = Providers[ProviderType.MaskWallet]
                    await maskProvider?.removeWallets(manageWallets)
                }
            }
            await Services.Identity.logoutPersona(currentPersona.identifier)
            const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
            if (!currentPersonaIdentifier) {
                const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
                await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona)
            }

            showSnackbar(t('popups_log_out_successfully'))
            navigate(PopupRoutes.Personas, { replace: true })
        } catch {
            showSnackbar(t('popups_log_out_failed'))
        }
    }, [currentPersona, Provider, wallet, wallets, smartPayChainId, manageWallets.length])

    return (
        <LogoutUI
            chainId={smartPayChainId}
            manageWallets={manageWallets}
            currentPersona={currentPersona}
            backupPassword={user.backupPassword ?? ''}
            verifyPaymentPassword={WalletRPC.verifyPassword}
            loading={loading || getHasPasswordLoading}
            hasPassword={hasPassword}
            onLogout={onLogout}
            onCancel={() => navigate(-1)}
        />
    )
})

export interface LogoutUIProps {
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

export const LogoutUI = memo<LogoutUIProps>(
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
        const { t } = useI18N()
        const theme = useTheme()
        const { classes } = useStyles()
        const [password, setPassword] = useState('')
        const [paymentPassword, setPaymentPassword] = useState('')
        const [error, setError] = useState(false)
        const [paymentPasswordError, setPaymentPasswordError] = useState('')

        useTitle(t('popups_log_out'))

        const onConfirm = useCallback(async () => {
            if (manageWallets.length && paymentPassword) {
                const verified = await verifyPaymentPassword(paymentPassword)
                if (!verified) {
                    setPaymentPasswordError(t('popups_wallet_unlock_error_password'))
                    return
                }
            }
            if (!backupPassword || backupPassword === password) onLogout()
            else setError(true)
        }, [onLogout, backupPassword, password, paymentPassword, manageWallets.length])

        const disabled = useMemo(() => {
            if (loading || error || paymentPasswordError) return
            if (manageWallets.length && hasPassword) return !!paymentPassword.length
            if (backupPassword) return !!password.length
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

        return (
            <Box>
                <Box p={2}>
                    <Box className={classes.infoBox}>
                        <PersonaAvatar size={30} avatar={currentPersona?.avatar} />
                        <Box>
                            <Typography fontWeight={700}>{currentPersona?.nickname}</Typography>
                            <Typography fontSize={10} color={theme.palette.maskColor.third} lineHeight="10px">
                                {currentPersona?.identifier.rawPublicKey}
                            </Typography>
                        </Box>
                    </Box>
                    {manageWallets.length ? (
                        <Box className={classes.wallets}>
                            {manageWallets.map((x, index) => (
                                <Box className={classes.infoBox} key={index}>
                                    <Icons.SmartPay size={30} />
                                    <Box>
                                        <Typography fontWeight={700}>{x.name}</Typography>
                                        <Typography
                                            color={theme.palette.maskColor.second}
                                            fontSize={10}
                                            display="flex"
                                            alignItems="center">
                                            {formatEthereumAddress(x.address, 4)}
                                            {chainId ? (
                                                <Link
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        color: theme.palette.maskColor.main,
                                                    }}
                                                    href={explorerResolver.addressLink(chainId, x.address)}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    <Icons.LinkOut size={16} />
                                                </Link>
                                            ) : null}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    ) : null}
                    <Typography className={classes.tips}>
                        {t('popups_log_out_tips')}
                        {currentPersona && manageWallets.length ? (
                            <Typography mt={2}>
                                <Trans
                                    i18nKey="popups_log_out_with_smart_pay_tips"
                                    values={{
                                        persona: currentPersona.nickname,
                                        addresses: manageWallets
                                            .map((x) => formatEthereumAddress(x.address, 4))
                                            .join(','),
                                    }}
                                />
                            </Typography>
                        ) : null}
                    </Typography>
                    {backupPassword ? (
                        manageWallets.length && hasPassword ? (
                            <PasswordField
                                show={false}
                                placeholder={t('popups_wallet_backup_input_password')}
                                value={paymentPassword}
                                error={!!paymentPasswordError}
                                helperText={paymentPasswordError}
                                onChange={(e) => {
                                    if (paymentPasswordError) setPaymentPasswordError('')
                                    setPaymentPassword(e.target.value)
                                }}
                            />
                        ) : (
                            <PasswordField
                                show={false}
                                placeholder={t('popups_backup_password')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={error}
                                helperText={error ? t('popups_password_do_not_match') : ''}
                            />
                        )
                    ) : null}
                </Box>
                <BottomController>
                    <Button variant="outlined" fullWidth onClick={onCancel}>
                        {t('cancel')}
                    </Button>
                    <ActionButton variant="contained" color="error" fullWidth onClick={onConfirm} disabled={disabled}>
                        {t('popups_log_out')}
                    </ActionButton>
                </BottomController>
            </Box>
        )
    },
)

export default Logout
