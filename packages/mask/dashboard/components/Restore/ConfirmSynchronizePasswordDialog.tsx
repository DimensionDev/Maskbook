import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { getMaskColor, MaskDialog } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { useDashboardI18N } from '../../locales/index.js'

export interface ConfirmSynchronizePasswordDialogProps {
    open: boolean
    onClose(): void
    onConform(): void
}

export const ConfirmSynchronizePasswordDialog = memo<ConfirmSynchronizePasswordDialogProps>(
    function ConfirmSynchronizePasswordDialog({ open, onClose, onConform }) {
        const t = useDashboardI18N()

        return (
            <MaskDialog open={open} title={t.cloud_backup()} onClose={onClose} maxWidth="xs">
                <DialogContent>
                    <Stack alignItems="center" py={2}>
                        <Icons.Success size={54} />
                        <Typography variant="caption" sx={{ color: (t) => getMaskColor(t).greenMain }} fontSize={24}>
                            {t.successful()}
                        </Typography>
                    </Stack>
                    <Typography variant="caption">
                        {t.sign_in_account_cloud_backup_synchronize_password_tip()}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={onClose}>
                        {t.personas_cancel()}
                    </Button>
                    <Button onClick={onConform}>{t.personas_confirm()}</Button>
                </DialogActions>
            </MaskDialog>
        )
    },
)
