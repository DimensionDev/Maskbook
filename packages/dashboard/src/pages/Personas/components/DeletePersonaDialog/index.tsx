import { Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { memo, useCallback } from 'react'
import { MaskColorVar, MaskDialog } from '@masknet/theme'
import { DashboardTrans, useDashboardI18N } from '../../../../locales'
import { Services } from '../../../../API'
import type { PersonaIdentifier } from '@masknet/shared'

export interface DeletePersonaDialogProps {
    open: boolean
    onClose: () => void
    nickname?: string
    identifier: PersonaIdentifier
}

export const DeletePersonaDialog = memo<DeletePersonaDialogProps>(({ open, onClose, nickname, identifier }) => {
    const t = useDashboardI18N()

    const handleDelete = useCallback(async () => {
        await Services.Identity.deletePersona(identifier, 'delete even with private')
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
                <Button color="secondary">{t.personas_cancel()}</Button>
                <Button onClick={handleDelete}>{t.personas_confirm()}</Button>
            </DialogActions>
        </MaskDialog>
    )
})
