import { Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { memo, useCallback } from 'react'
import { MaskColorVar, MaskDialog, useCustomSnackbar } from '@masknet/theme'
import { DashboardTrans, useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import type { PersonaIdentifier } from '@masknet/shared'
import { PersonaContext } from '../../hooks/usePersonaContext'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../../type'

export interface DeletePersonaDialogProps {
    open: boolean
    onClose: () => void
    nickname?: string
    identifier: PersonaIdentifier
}

export const DeletePersonaDialog = memo<DeletePersonaDialogProps>(({ open, onClose, nickname, identifier }) => {
    const t = useDashboardI18N()
    const { changeCurrentPersona } = PersonaContext.useContainer()
    const navigate = useNavigate()
    const { showSnackbar } = useCustomSnackbar()

    const handleDelete = useCallback(async () => {
        await Services.Identity.deletePersona(identifier, 'delete even with private')
        const lastedPersona = await Services.Identity.queryLastPersonaCreated()

        if (lastedPersona) {
            await changeCurrentPersona(lastedPersona.identifier)
        } else {
            showSnackbar(t.personas_setup_tip(), { variant: 'warning' })
            navigate(RoutePaths.Setup)
        }
    }, [nickname, identifier])

    return (
        <MaskDialog open={open} title={t.personas_delete_dialog_title()} onClose={onClose}>
            <DialogContent>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    <DashboardTrans.personas_delete_confirm_tips
                        components={{ i: <span style={{ color: MaskColorVar.primary }} /> }}
                        values={{ nickname: nickname ?? '' }}
                    />
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={onClose}>
                    {t.personas_cancel()}
                </Button>
                <Button onClick={handleDelete}>{t.personas_confirm()}</Button>
            </DialogActions>
        </MaskDialog>
    )
})
