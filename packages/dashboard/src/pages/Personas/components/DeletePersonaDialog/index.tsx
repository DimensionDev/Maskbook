import { Button, DialogActions, DialogContent, Typography, TextField } from '@material-ui/core'
import { memo } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N, DashboardTrans } from '../../../../locales'

export interface DeletePersonaDialogProps {
    open: boolean
    onClose: () => void
    nickname?: string
}

export const DeletePersonaDialog = memo<DeletePersonaDialogProps>(({ open, onClose, nickname }) => {
    const t = useDashboardI18N()
    return (
        <MaskDialog open={open} title={t.personas_delete_dialog_title()} onClose={onClose}>
            <DialogContent>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                    <DashboardTrans.personas_delete_confirm_tips
                        components={{ i: <span style={{ color: MaskColorVar.primary }} /> }}
                        values={{ nickname: nickname ?? '' }}
                    />
                </Typography>
                <TextField
                    variant="filled"
                    InputProps={{ disableUnderline: true }}
                    sx={{ width: '100%', marginTop: 2.75 }}
                />
            </DialogContent>
            <DialogActions>
                <Button color="secondary">{t.personas_cancel()}</Button>
                <Button>{t.personas_confirm()}</Button>
            </DialogActions>
        </MaskDialog>
    )
})
