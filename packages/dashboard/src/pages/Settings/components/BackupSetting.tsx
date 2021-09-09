import SettingButton from './SettingButton'
import { useContext, useEffect, useState } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import BackupModeSelectDialog from './dialogs/BackupModeSelectDialog'
import { Action, CloudBackupPreviewDialog } from './dialogs/CloudBackupPreviewDialog'
import { CloudBackupMergeDialog } from './dialogs/CloudBackupMergeDialog'
import { useDashboardI18N } from '../../../locales'
import { CloudBackupVerifyDialog, VerifyNextData } from './dialogs/CloudBackupVerifyDialog'
import { UserContext } from '../hooks/UserContext'
import type { VerifyCodeRequest } from '../api'
import type { BackupFileInfo } from '../type'
import { useLocation } from 'react-router'

export default function BackupSetting() {
    const t = useDashboardI18N()
    const { state } = useLocation() as { state: { open: 'setting' | null } }
    const { ensurePasswordSet } = useContext(UserContext)
    const [showDialog, setShowDialog] = useState({
        backup: false,
        mode: false,
        verify: false,
        preview: false,
        merge: false,
    })
    const [localMode, setLocalMode] = useState(true)
    const [params, setParams] = useState<VerifyCodeRequest | undefined>(undefined)
    const [cloudFileInfo, setCloudFileInfo] = useState<BackupFileInfo | undefined>(undefined)

    useEffect(() => {
        ensurePasswordSet(() => setShowDialog({ ...showDialog, mode: state?.open === 'setting' }))
    }, [state?.open])

    const onBackup = () => {
        ensurePasswordSet(() => setShowDialog({ ...showDialog, mode: true }))
    }

    const onSelectMode = (mode: 'local' | 'cloud') => {
        if (mode === 'cloud') {
            setLocalMode(false)
            setShowDialog({ ...showDialog, mode: false, verify: true })
        } else {
            setLocalMode(true)
            setShowDialog({ ...showDialog, mode: false, backup: true })
        }
    }

    const handleVerified = ({ fileInfo, params }: VerifyNextData) => {
        setParams(params)

        if (fileInfo) {
            setCloudFileInfo(fileInfo)
            setShowDialog({ ...showDialog, verify: false, preview: true })
        } else {
            setShowDialog({ ...showDialog, verify: false, backup: true })
        }
    }

    const handleAction = (action: Action) => {
        if (action === 'merge') {
            setShowDialog({ ...showDialog, preview: false, merge: true })
        } else {
            setShowDialog({ ...showDialog, preview: false, backup: true })
        }
    }

    return (
        <>
            <SettingButton onClick={onBackup}>{t.settings_button_backup()}</SettingButton>
            {showDialog.backup ? (
                <BackupDialog
                    local={localMode}
                    params={params}
                    open={showDialog.backup}
                    onClose={() => setShowDialog({ ...showDialog, backup: false })}
                />
            ) : null}

            <BackupModeSelectDialog
                open={showDialog.mode}
                onClose={() => setShowDialog({ ...showDialog, mode: false })}
                onSelect={onSelectMode}
            />
            {showDialog.verify ? (
                <CloudBackupVerifyDialog
                    open={showDialog.verify}
                    onClose={() => setShowDialog({ ...showDialog, verify: false })}
                    onNext={handleVerified}
                />
            ) : null}

            {cloudFileInfo && params ? (
                <>
                    <CloudBackupPreviewDialog
                        info={cloudFileInfo}
                        open={showDialog.preview}
                        onSelect={handleAction}
                        onClose={() => setShowDialog({ ...showDialog, preview: false })}
                    />
                    <CloudBackupMergeDialog
                        account={params.account}
                        info={cloudFileInfo}
                        open={showDialog.merge}
                        onClose={() => setShowDialog({ ...showDialog, merge: false })}
                    />
                </>
            ) : null}
        </>
    )
}
