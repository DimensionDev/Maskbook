import { Box, Button, DialogActions, DialogContent, Typography } from '@material-ui/core'
import { memo } from 'react'
import { MaskDialog, MaskTextField } from '@masknet/theme'
import { useDashboardI18N } from '../../../../locales'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../../../type'
import type { PersonaIdentifier } from '@masknet/shared'
import { useExportPrivateKey } from '../../hooks/useExportPrivateKey'

export interface ExportPrivateKeyDialogProps {
    open: boolean
    onClose: () => void
    identifier: PersonaIdentifier
}

export const ExportPrivateKeyDialog = memo<ExportPrivateKeyDialogProps>(({ open, onClose, identifier }) => {
    const t = useDashboardI18N()
    const navigate = useNavigate()
    const { value: privateKey } = useExportPrivateKey(identifier)

    return (
        <MaskDialog open={open} title={t.personas_export_persona()} onClose={onClose}>
            <DialogContent>
                <MaskTextField value={privateKey} InputProps={{ disableUnderline: true }} fullWidth />
                <Box sx={{ mt: 3 }}>
                    <Typography variant="caption">
                        {t.personas_export_private_key_tip()}
                        <Button
                            variant="text"
                            sx={{ fontSize: 12, py: 0 }}
                            onClick={() => navigate(RoutePaths.Settings)}>
                            {t.settings_global_backup_title()}
                        </Button>
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color="secondary">{t.personas_cancel()}</Button>
                <Button>{t.personas_confirm()}</Button>
            </DialogActions>
        </MaskDialog>
    )
})
