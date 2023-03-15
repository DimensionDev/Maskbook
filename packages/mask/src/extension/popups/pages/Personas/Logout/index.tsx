import { memo, useCallback, useMemo, useState } from 'react'
import { MaskColorVar, makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { Button, Typography, Box, List, ListItem, Stack, Link } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { useAsyncFn } from 'react-use'
import { PersonaContext } from '../hooks/usePersonaContext.js'
import Services from '../../../../service.js'
import { LoadingButton } from '@mui/lab'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes, type PersonaInformation, NetworkPluginID, formatPersonaFingerprint } from '@masknet/shared-base'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { useChainContext, useWallet, useWallets, useWeb3Connection, useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress, Wallet } from '@masknet/web3-shared-base'
import { formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { Trans } from 'react-i18next'
import { first } from 'lodash-es'
import { useContainer } from 'unstated-next'
import { PopupContext } from '../../../hook/usePopupContext.js'
import { WalletRPC } from '../../../../../plugins/Wallet/messages.js'
import { FormattedAddress } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    content: {
        flex: 1,
        padding: '30px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
        color: '#FF5F5F',
        marginTop: 12,
    },
    tips: {
        color: '#FF5555',
        fontSize: 13,
        lineHeight: '18px',
    },
    controller: {
        padding: '0 16px 16px 16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 20,
    },
    button: {
        fontWeight: 600,
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    password: {
        padding: '0 16px 20px 16px',
    },
}))

const Logout = memo(() => {
    const { selectedPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const wallet = useWallet()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection()
    const { Provider } = useWeb3State()
    const { smartPayChainId } = useContainer(PopupContext)

    const backupPassword = useMemo(() => {
        try {
            const password = localStorage.getItem('backupPassword')
            if (!password) return ''
            return atob(password)
        } catch {
            return ''
        }
    }, [])

    const manageWallets = useMemo(() => {
        return wallets.filter((x) => isSameAddress(x.owner, selectedPersona?.address))
    }, [wallets, selectedPersona])

    const [{ loading }, onLogout] = useAsyncFn(async () => {
        if (!selectedPersona) return
        if (selectedPersona.address) {
            if (isSameAddress(selectedPersona.address, wallet?.owner)) {
                const newWallet = first(wallets)
                await connection?.connect({
                    account: newWallet?.address,
                    chainId: newWallet?.owner ? smartPayChainId : undefined,
                })
            }

            if (manageWallets.length) {
                const maskProvider = Provider?.getWalletProvider(ProviderType.MaskWallet)
                await maskProvider?.removeWallets(manageWallets)
            }
        }
        await Services.Identity.logoutPersona(selectedPersona.identifier)
        const currentPersona = await Services.Settings.getCurrentPersonaIdentifier()
        if (!currentPersona) {
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()
            await Services.Settings.setCurrentPersonaIdentifier(lastCreatedPersona)
        }
        navigate(PopupRoutes.Personas, { replace: true })
    }, [selectedPersona, history, Provider, wallet, wallets, connection, smartPayChainId, manageWallets.length])

    return (
        <LogoutUI
            manageWallets={manageWallets}
            selectedPersona={selectedPersona}
            backupPassword={backupPassword ?? ''}
            verifyPaymentPassword={WalletRPC.verifyPassword}
            loading={loading}
            onLogout={onLogout}
            onCancel={() => navigate(-1)}
        />
    )
})

export interface LogoutUIProps {
    manageWallets: Wallet[]
    selectedPersona?: PersonaInformation
    verifyPaymentPassword: (password: string) => Promise<boolean>
    backupPassword: string
    loading: boolean
    onCancel: () => void
    onLogout: () => void
}

export const LogoutUI = memo<LogoutUIProps>(
    ({ backupPassword, loading, onLogout, onCancel, selectedPersona, manageWallets, verifyPaymentPassword }) => {
        const { t } = useI18N()
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

        return (
            <>
                <div className={classes.content}>
                    <Icons.CircleWarning size={64} />
                    <Typography className={classes.title}>{t('popups_persona_logout')}</Typography>
                    <Box sx={{ paddingTop: 1.5, paddingBottom: 3, width: '100%' }}>
                        <ManageWallet manageWallets={manageWallets} />
                    </Box>
                    <Typography className={classes.tips}>{t('popups_persona_disconnect_tip')}</Typography>
                    {manageWallets.length ? (
                        <>
                            <br />
                            <Typography className={classes.tips}>
                                <Trans
                                    i18nKey="popups_persona_disconnect_manage_wallet_warning"
                                    values={{
                                        addresses: manageWallets
                                            .map((x) => formatEthereumAddress(x.address, 4))
                                            .join(','),
                                        persona: selectedPersona?.nickname ?? '',
                                    }}
                                    components={{
                                        span: <Typography component="span" sx={{ wordBreak: 'break-word' }} />,
                                    }}
                                />
                            </Typography>
                        </>
                    ) : null}
                </div>

                {backupPassword ? (
                    <div className={classes.password}>
                        <PasswordField
                            show={false}
                            placeholder={t('popups_backup_password')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                            helperText={error ? t('popups_password_do_not_match') : ''}
                        />
                    </div>
                ) : null}

                {manageWallets.length ? (
                    <div className={classes.password}>
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
                    </div>
                ) : null}
                <div className={classes.controller}>
                    <Button
                        variant="contained"
                        className={classes.button}
                        onClick={onCancel}
                        style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}>
                        {t('cancel')}
                    </Button>
                    <LoadingButton
                        loading={loading}
                        variant="contained"
                        className={classes.button}
                        color="error"
                        style={{ backgroundColor: '#ff5555' }}
                        onClick={onConfirm}>
                        {t('popups_persona_logout')}
                    </LoadingButton>
                </div>
            </>
        )
    },
)

const useWalletsStyles = makeStyles<{ length: number }>()((theme, props) => ({
    persona: {
        padding: '8px 16px',
        display: 'flex',
        gap: 20,
        backgroundColor: MaskColorVar.publicBackground,
        borderRadius: 8,
    },
    nickname: {
        lineHeight: '16px',
        fontWeight: 600,
        fontSize: 14,
        color: theme.palette.maskColor.primary,
    },
    finger: {
        lineHeight: '16px',
        fontWeight: 400,
        fontSize: 12,
        color: theme.palette.maskColor.primary,
    },
    wallets: {
        gridGap: '12px 12px',
        display: 'grid',
        gridTemplateColumns: `repeat(${props.length > 1 ? 2 : 1}, 1fr)`,
        marginTop: 12,
        padding: 0,
    },
    wallet: {
        padding: '8px',
        display: 'flex',
        gap: 8,
        backgroundColor: MaskColorVar.publicBackground,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    link: {
        cursor: 'pointer',
        zIndex: 1,
        '&:hover': {
            textDecoration: 'none',
        },
        lineHeight: 0,
        marginLeft: 6,
    },
}))
interface ManageWalletProps {
    manageWallets: Wallet[]
}

function ManageWallet({ manageWallets }: ManageWalletProps) {
    const { classes } = useWalletsStyles({ length: manageWallets.length })
    const { selectedPersona } = PersonaContext.useContainer()

    return (
        <Box>
            <Box className={classes.persona}>
                <Box>
                    <Icons.Masks />
                </Box>
                <Stack justifyContent="center">
                    <Typography variant="body1" className={classes.nickname}>
                        {selectedPersona?.nickname}
                    </Typography>
                    <Typography variant="caption" className={classes.finger}>
                        {formatPersonaFingerprint(selectedPersona?.identifier.rawPublicKey ?? '')}
                    </Typography>
                </Stack>
            </Box>
            {manageWallets.length ? (
                <List className={classes.wallets}>
                    {manageWallets.map((wallet, i) => (
                        <WalletItem wallet={wallet} key={i} />
                    ))}
                </List>
            ) : null}
        </Box>
    )
}

interface WalletItemProps {
    wallet: Wallet
}
function WalletItem({ wallet }: WalletItemProps) {
    const { classes } = useWalletsStyles({ length: 1 })
    const { Others } = useWeb3State()
    const { chainId } = useChainContext()
    return (
        <ListItem className={classes.wallet}>
            <Icons.SmartPay />
            <Stack flexDirection="column">
                <Typography className={classes.nickname}>{wallet.name}</Typography>
                <Typography className={classes.finger}>
                    <FormattedAddress address={wallet.address} size={4} formatter={Others?.formatAddress} />
                    <Link
                        className={classes.link}
                        href={Others?.explorerResolver.addressLink(chainId, wallet.address)}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.LinkOut size={12} sx={{ transform: 'translate(0px, 2px)' }} />
                    </Link>
                </Typography>
            </Stack>
        </ListItem>
    )
}

export default Logout
