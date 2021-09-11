import { Box, Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { memo, useCallback } from 'react'
import { getMaskColor, makeStyles, MaskDialog, useSnackbar } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import type { PersonaIdentifier } from '@masknet/shared'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import { WarningIcon } from '@masknet/icons'

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
    const { enqueueSnackbar } = useSnackbar()
    const { changeCurrentPersona } = PersonaContext.useContainer()

    const handleDelete = useCallback(async () => {
        await Services.Identity.logoutPersona(identifier)
        const lastCreatedPersona = await Services.Identity.queryLastPersonaCreated()

        if (lastCreatedPersona) {
            await changeCurrentPersona(lastCreatedPersona.identifier)
        } else {
            enqueueSnackbar(t.personas_setup_tip(), { variant: 'warning' })
            navigate(RoutePaths.Setup)
        }
    }, [identifier])

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
                <Button color="secondary" onClick={onClose}>
                    {t.personas_cancel()}
                </Button>
                <Button color="error" onClick={handleDelete}>
                    {t.personas_logout()}
                </Button>
            </DialogActions>
        </MaskDialog>
    )
})
