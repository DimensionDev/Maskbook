import { Icons } from '@masknet/icons'
import { CrossIsolationMessages, DashboardRoutes, type PersonaIdentifier } from '@masknet/shared-base'
import { MaskDialog } from '@masknet/theme'
import { useWallets } from '@masknet/web3-hooks-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Services } from '../../../../API.js'
import { DashboardTrans, useDashboardI18N } from '../../../../locales/index.js'
import { PersonaContext } from '../../hooks/usePersonaContext.js'

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

        const handleLogout = useCallback(async () => {
            await Services.Identity.logoutPersona(identifier)
            const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()

            if (address) {
                CrossIsolationMessages.events.ownerDeletionEvent.sendToAll({ owner: address })
            }
            if (lastCreatedPersona) {
                await changeCurrentPersona(lastCreatedPersona)
                onClose()
            } else {
                onClose()
                navigate(DashboardRoutes.Setup)
            }
        }, [identifier, onClose, address])

        const manageWallets = useMemo(() => {
            return wallets.filter((x) => x.identifier === identifier.toText())
        }, [wallets, identifier])

        return (
            <MaskDialog open={open} title={t.personas_logout()} onClose={onClose} maxWidth="xs">
                <DialogContent>
                    <Box>
                        <Box textAlign="center" py={2}>
                            <Icons.Warning size={64} color="warning" />
                        </Box>
                    </Box>
                    <Typography color="error" variant="body2" fontSize={13}>
                        {t.personas_logout_warning()}
                    </Typography>
                    {manageWallets.length ? (
                        <Typography color="error" variant="body2" fontSize={13} sx={{ wordBreak: 'break-all' }}>
                            <DashboardTrans.personas_logout_manage_wallet_warning
                                values={{
                                    persona: nickname ?? '',
                                    addresses: manageWallets.map((x) => formatEthereumAddress(x.address, 4)).join(','),
                                }}
                                components={{
                                    span: <Typography component="span" sx={{ wordBreak: 'break-all', fontSize: 12 }} />,
                                }}
                            />
                        </Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={onClose} sx={{ minWidth: 150 }}>
                        {t.personas_cancel()}
                    </Button>
                    <LoadingButton color="error" onClick={handleLogout} sx={{ minWidth: 150 }} variant="contained">
                        {t.personas_logout()}
                    </LoadingButton>
                </DialogActions>
            </MaskDialog>
        )
    },
)
