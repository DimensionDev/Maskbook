import { memo, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingButton } from '@mui/lab'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { Providers } from '@masknet/web3-providers'
import { DashboardRoutes, type PersonaIdentifier } from '@masknet/shared-base'
import { MaskDialog } from '@masknet/theme'
import { ManageWallet } from '@masknet/shared'
import { useWallets } from '@masknet/web3-hooks-base'
import { formatEthereumAddress, ProviderType } from '@masknet/web3-shared-evm'
import { PluginServices, Services } from '../../../../API.js'
import { DashboardTrans, useDashboardI18N } from '../../../../locales/index.js'
import { PersonaContext } from '../../hooks/usePersonaContext.js'
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
        const { changeCurrentPersona, currentPersona } = PersonaContext.useContainer()
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
                const maskProvider = Providers[ProviderType.MaskWallet]
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
                        <ManageWallet manageWallets={manageWallets} persona={currentPersona} />
                    </Box>
                    <Typography color="error" variant="body2" fontSize={13}>
                        {t.personas_logout_warning()}
                    </Typography>
                    {manageWallets.length ? (
                        <Typography
                            color="error"
                            variant="body2"
                            fontSize={13}
                            sx={{ wordBreak: 'break-word', marginTop: 2 }}>
                            <DashboardTrans.personas_logout_manage_wallet_warning
                                values={{
                                    persona: nickname ?? '',
                                    addresses: manageWallets.map((x) => formatEthereumAddress(x.address, 4)).join(','),
                                }}
                                components={{
                                    span: (
                                        <Typography component="span" sx={{ wordBreak: 'break-word', fontSize: 12 }} />
                                    ),
                                }}
                            />
                        </Typography>
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
