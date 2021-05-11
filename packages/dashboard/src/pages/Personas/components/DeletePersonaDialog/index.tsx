import { Button, DialogActions, DialogContent, Link, Typography, TextField } from '@material-ui/core'
import { memo } from 'react'
import { MaskDialog } from '@dimensiondev/maskbook-theme'
import { useDashboardI18N } from '../../../../locales'

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
                    {/*<Trans i18nKey="personas_delete_confirm_tips" components={{ link: Link }} values={{ nickname }} />*/}
                    Please confirm that you have deleted persona <Link>{nickname}</Link> and entered your password.
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
