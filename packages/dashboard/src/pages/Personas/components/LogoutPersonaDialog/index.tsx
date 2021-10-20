import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { getMaskColor, makeStyles, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import type { PersonaIdentifier } from '@masknet/shared'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../../type'
import { WarningIcon } from '@masknet/icons'
import { LoadingButton } from '../../../../components/LoadingButton'

const useStyles = makeStyles()((theme) => ({
    svg: {
        '& path': {
            fill: getMaskColor(theme).redMain,
        },
    },
}))

export interface LogoutPersonaDialogProps {
    open: boolean
    onClose: () => void
    identifier: PersonaIdentifier
}

export const LogoutPersonaDialog = memo<LogoutPersonaDialogProps>(({ open, onClose, identifier }) => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()

    const handleLogout = useCallback(async () => {
        await Services.Identity.logoutPersona(identifier)
        const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()

        if (lastCreatedPersona) {
            await changeCurrentPersona(lastCreatedPersona.identifier)
            onClose()
        } else {
            showSnackbar(t.personas_setup_tip(), { variant: 'warning' })
            onClose()
            navigate(RoutePaths.Setup)
        }
    }, [identifier, onClose])

    return (
        <MaskDialog open={open} title={t.personas_logout()} onClose={onClose} maxWidth="xs">
            <DialogContent>
                <Box>
                    <Box textAlign="center" py={2}>
                        <WarningIcon className={classes.svg} sx={{ fontSize: 64 }} color="warning" />
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
                <LoadingButton color="error" onClick={handleLogout} sx={{ minWidth: 150 }}>
                    {t.personas_logout()}
                </LoadingButton>
            </DialogActions>
        </MaskDialog>
    )
})
