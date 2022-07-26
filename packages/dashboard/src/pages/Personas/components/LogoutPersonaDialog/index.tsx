import { WarningIcon } from '@masknet/icons'
import { DashboardRoutes, PersonaIdentifier } from '@masknet/shared-base'
import { MaskDialog } from '@masknet/theme'
import { LoadingButton } from '@mui/lab'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Services } from '../../../../API'
import { useDashboardI18N } from '../../../../locales'
import { PersonaContext } from '../../hooks/usePersonaContext'

export interface LogoutPersonaDialogProps {
    open: boolean
    onClose: () => void
    identifier: PersonaIdentifier
}

export const LogoutPersonaDialog = memo<LogoutPersonaDialogProps>(({ open, onClose, identifier }) => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const handleLogout = useCallback(async () => {
        await Services.Identity.logoutPersona(identifier)
        const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()

        if (lastCreatedPersona) {
            await changeCurrentPersona(lastCreatedPersona)
            onClose()
        } else {
            onClose()
            navigate(DashboardRoutes.Setup)
        }
    }, [identifier, onClose])

    return (
        <MaskDialog open={open} title={t.personas_logout()} onClose={onClose} maxWidth="xs">
            <DialogContent>
                <Box>
                    <Box textAlign="center" py={2}>
                        <WarningIcon size={64} color="warning" />
                    </Box>
                </Box>
                <Typography color="error" variant="body2" fontSize={13}>
                    {t.personas_logout_warning()}
                </Typography>
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
})
