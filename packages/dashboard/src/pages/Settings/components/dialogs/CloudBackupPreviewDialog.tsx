import { MaskDialog } from '@masknet/theme'
import { Box, Typography, Button } from '@material-ui/core'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard'
import { useDashboardI18N } from '../../../../locales'
import type { BackupFileInfo } from '../../type'

export type Action = 'merge' | 'upload'

export interface CloudBackupPreviewDialogProps {
    info: BackupFileInfo
    open: boolean
    onClose(): void
    onSelect(action: Action): void
}

export function CloudBackupPreviewDialog({ info, open, onClose, onSelect }: CloudBackupPreviewDialogProps) {
    const t = useDashboardI18N()

    return (
        <MaskDialog maxWidth="xs" title={t.settings_cloud_backup()} open={open} onClose={onClose}>
            <Box sx={{ padding: '0 24px 24px' }}>
                <BackupInfoCard info={info} />
                <Typography sx={{ fontSize: '13px', padding: '24px 0' }}>
                    {t.settings_dialogs_backup_action_desc()}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button sx={{ width: '184px' }} onClick={() => onSelect('merge')}>
                        {t.settings_dialogs_merge_to_local()}
                    </Button>
                    <Button sx={{ width: '184px' }} onClick={() => onSelect('upload')}>
                        {t.settings_dialogs_upload_local_data()}
                    </Button>
                </Box>
            </Box>
        </MaskDialog>
    )
}
