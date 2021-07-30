import { memo, useState } from 'react'
import { useDashboardI18N } from '../../locales'
import { Box } from '@material-ui/core'
import { MaskAlert } from '../MaskAlert'
import { CodeValidation } from './CodeValidation'
import { fetchBackupValue } from '../../pages/Settings/api'
import { Services } from '../../API'
import BackupPreviewCard from '../../pages/Settings/components/BackupPreviewCard'

enum RestoreStatus {
    validation,
    preview,
    restore,
}

export const RestoreFromCloud = memo(() => {
    const t = useDashboardI18N()
    const [backupJson, setBackupJson] = useState<any | null>(null)
    const [restoreStatus, setRestoreStatus] = useState(RestoreStatus.validation)

    const onValidated = async (downloadLink: string, account: string, password: string) => {
        const backupValue = await fetchBackupValue(downloadLink)
        const backupText = await Services.Crypto.decryptBackup('password', 'account', backupValue)
        const backupInfo = await Services.Welcome.parseBackupStr(backupText)
        setBackupJson(backupInfo?.info)
        setRestoreStatus(RestoreStatus.preview)
    }

    return (
        <>
            {restoreStatus === RestoreStatus.validation && (
                <Box sx={{ width: '100%' }}>
                    <CodeValidation onValidated={onValidated} />
                </Box>
            )}
            {restoreStatus === RestoreStatus.preview && (
                <Box>
                    <BackupPreviewCard json={backupJson} />
                </Box>
            )}
            <Box sx={{ marginTop: '35px', width: '100%' }}>
                <MaskAlert description={t.sign_in_account_cloud_backup_warning()} />
            </Box>
        </>
    )
})
