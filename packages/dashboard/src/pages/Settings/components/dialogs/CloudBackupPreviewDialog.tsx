import { MaskDialog } from '@masknet/theme'
import { Box, Typography, Button } from '@material-ui/core'
import { BackupInfoCard } from '../../../../components/Restore/BackupInfoCard'
import type { BackupFileInfo } from '../../type'

export type Action = 'merge' | 'upload'

export interface CloudBackupPreviewDialogProps {
    info: BackupFileInfo
    open: boolean
    onClose(): void
    onSelect(action: Action): void
}

export function CloudBackupPreviewDialog({ info, open, onClose, onSelect }: CloudBackupPreviewDialogProps) {
    return (
        <MaskDialog maxWidth="xs" title="Cloud Backup" open={open} onClose={onClose}>
            <Box sx={{ padding: '0 24px 24px' }}>
                <BackupInfoCard info={info} />
                <Typography sx={{ fontSize: '13px', padding: '24px 0' }}>
                    There is already a cloud backup, please decide whether you want to merge the cloud backup to local
                    or upload your local data to cloud.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button sx={{ width: '184px' }} onClick={() => onSelect('merge')}>
                        Merge to local
                    </Button>
                    <Button sx={{ width: '184px' }} onClick={() => onSelect('upload')}>
                        Upload local data
                    </Button>
                </Box>
            </Box>
        </MaskDialog>
    )
}
