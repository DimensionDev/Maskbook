import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { DashboardRoutes, PersonaIdentifier, formatPersonaFingerprint } from '@masknet/shared-base'
import { MaskColorVar, MaskDialog, makeStyles } from '@masknet/theme'
import { useChainContext, useWallets, useWeb3State } from '@masknet/web3-hooks-base'
import { formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'
import { Box, Button, DialogActions, DialogContent, Typography, Stack, List, ListItem, Link } from '@mui/material'
import { PluginServices, Services } from '../../../../API.js'
import { DashboardTrans, useDashboardI18N } from '../../../../locales/index.js'
import { PersonaContext } from '../../hooks/usePersonaContext.js'
import { Wallet, isSameAddress } from '@masknet/web3-shared-base'
import { FormattedAddress } from '@masknet/shared'
import PasswordField from '../../../../components/PasswordField/index.js'

export interface LogoutPersonaDialogProps {
    open: boolean
    nickname?: string
    address?: string
    onClose: () => void
    identifier: PersonaIdentifier
}

export const LogoutPersonaDialog = memo<LogoutPersonaDialogProps>(
    ({ open, onClose, identifier, nickname, address }) => {
        const t = useDashboardI18N()
        const navigate = useNavigate()
        const wallets = useWallets()
        const { changeCurrentPersona } = PersonaContext.useContainer()
        const { Provider } = useWeb3State()
        const [password, setPassword] = useState('')
        const [error, setError] = useState('')

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
            return wallets.filter((x) => x.identifier === identifier.toText())
        }, [wallets, identifier])

        const onConfirm = useCallback(async () => {
            if (manageWallets.length && password) {
                const verified = await PluginServices.Wallet.verifyPassword(password)
                if (!verified) {
                    setError(t.settings_dialogs_incorrect_password())
                    return
                }
            }

            if (backupPassword && backupPassword !== password) {
                setError(t.settings_dialogs_incorrect_password())
                return
            }

            handleLogout()
        }, [password, backupPassword, manageWallets])

        const handleLogout = useCallback(async () => {
            if (address && manageWallets.length) {
                const maskProvider = Provider?.getWalletProvider(ProviderType.MaskWallet)
                await maskProvider?.removeWallets(manageWallets)
            }
            await Services.Identity.logoutPersona(identifier)
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()

            if (lastCreatedPersona) {
                await changeCurrentPersona(lastCreatedPersona)
                onClose()
            } else {
                onClose()
                navigate(DashboardRoutes.Setup)
            }
        }, [identifier, onClose, address, manageWallets.length])

        return (
            <MaskDialog open={open} title={t.personas_logout()} onClose={onClose} maxWidth="xs">
                <DialogContent sx={{ paddingBottom: 0 }}>
                    <Box>
                        <Box textAlign="center" py={2}>
                            <Icons.Warning size={64} color="warning" />
                        </Box>
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                        <ManageWallet />
                    </Box>
                    <Typography color="error" variant="body2" fontSize={13}>
                        {t.personas_logout_warning()}
                    </Typography>
                    {manageWallets.length ? (
                        <>
                            <br />
                            <Typography color="error" variant="body2" fontSize={13} sx={{ wordBreak: 'break-word' }}>
                                <DashboardTrans.personas_logout_manage_wallet_warning
                                    values={{
                                        persona: nickname ?? '',
                                        addresses: manageWallets
                                            .map((x) => formatEthereumAddress(x.address, 4))
                                            .join(','),
                                    }}
                                    components={{
                                        span: (
                                            <Typography
                                                component="span"
                                                sx={{ wordBreak: 'break-word', fontSize: 12 }}
                                            />
                                        ),
                                    }}
                                />
                            </Typography>
                        </>
                    ) : null}

                    {backupPassword ? (
                        <PasswordField
                            sx={{ flex: 1, marginTop: 1.5 }}
                            placeholder={t.settings_label_backup_password()}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value)
                                setError('')
                            }}
                            error={!!error}
                            helperText={error}
                        />
                    ) : null}
                    {manageWallets.length ? (
                        <PasswordField
                            sx={{ flex: 1, marginTop: 1.5 }}
                            show={false}
                            onChange={(e) => {
                                setPassword(e.currentTarget.value)
                                setError('')
                            }}
                            placeholder={t.settings_label_payment_password()}
                            error={!!error}
                            helperText={error}
                        />
                    ) : null}
                </DialogContent>
                <DialogActions sx={{ padding: 3 }}>
                    <Button color="secondary" onClick={onClose} sx={{ minWidth: 150, flex: 1 }}>
                        {t.personas_cancel()}
                    </Button>
                    <LoadingButton
                        color="error"
                        onClick={onConfirm}
                        sx={{ minWidth: 150, flex: 1 }}
                        variant="contained">
                        {t.personas_logout()}
                    </LoadingButton>
                </DialogActions>
            </MaskDialog>
        )
    },
)

const useStyles = makeStyles<{ length: number }>()((theme, props) => ({
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
        color: MaskColorVar.primary,
    },
    finger: {
        lineHeight: '16px',
        fontWeight: 400,
        fontSize: 12,
        color: MaskColorVar.primary,
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
interface ManageWalletProps {}

function ManageWallet(props: ManageWalletProps) {
    const wallets = useWallets()
    const { currentPersona } = PersonaContext.useContainer()
    const manageWallets = useMemo(() => {
        return wallets.filter((x) => isSameAddress(x.owner, currentPersona?.address))
    }, [wallets, currentPersona])

    const { classes } = useStyles({ length: manageWallets.length })
    return (
        <Box>
            <Box className={classes.persona}>
                <Box>
                    <Icons.Masks />
                </Box>
                <Stack justifyContent="center">
                    <Typography variant="body1" className={classes.nickname}>
                        {currentPersona?.nickname}
                    </Typography>
                    <Typography variant="caption" className={classes.finger}>
                        {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '')}
                    </Typography>
                </Stack>
            </Box>
            {manageWallets.length ? (
                <List className={classes.wallets}>
                    {manageWallets.map((wallet) => (
                        <WalletItem wallet={wallet} key={wallet.address} />
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
    const { classes } = useStyles({ length: 1 })
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
