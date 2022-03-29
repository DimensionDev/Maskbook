import SettingButton from './SettingButton'
import { useContext, useEffect, useState } from 'react'
import BackupDialog from './dialogs/BackupDialog'
import BackupModeSelectDialog from './dialogs/BackupModeSelectDialog'
import { CloudBackupMergeDialog } from './dialogs/CloudBackupMergeDialog'
import { useDashboardI18N } from '../../../locales'
import { CloudBackupVerifyDialog, VerifyNextData } from './dialogs/CloudBackupVerifyDialog'
import { UserContext } from '../hooks/UserContext'
import type { VerifyCodeRequest } from '../api'
import type { BackupFileInfo } from '../type'
import { useLocation } from 'react-router-dom'

export default function BackupSetting() {
    const t = useDashboardI18N()
    const { state } = useLocation() as { state: { open: 'setting' | null } }
    const { ensurePasswordSet } = useContext(UserContext)
    const [merged, setMerged] = useState(false)
    const [visibleDialog, setVisibleDialog] = useState({
        backup: false,
        mode: false,
        verify: false,
        merge: false,
    })
    const [localMode, setLocalMode] = useState(true)
    const [params, setParams] = useState<VerifyCodeRequest | undefined>(undefined)
    const [cloudFileInfo, setCloudFileInfo] = useState<BackupFileInfo | undefined>(undefined)

    useEffect(() => {
        if (!state?.open || state?.open !== 'setting') return
        ensurePasswordSet(() => setVisibleDialog({ ...visibleDialog, mode: true }))
    }, [state?.open])

    const onBackup = () => {
        ensurePasswordSet(() => setVisibleDialog({ ...visibleDialog, mode: true }))
    }

    const onSelectMode = (mode: 'local' | 'cloud') => {
        if (mode === 'cloud') {
            setLocalMode(false)
            setVisibleDialog({ ...visibleDialog, mode: false, verify: true })
        } else {
            setLocalMode(true)
            setVisibleDialog({ ...visibleDialog, mode: false, backup: true })
        }
    }

    const handleVerified = ({ fileInfo, params }: VerifyNextData) => {
        setParams(params)

        if (fileInfo) {
            setCloudFileInfo(fileInfo)
            setVisibleDialog({ ...visibleDialog, verify: false, merge: true })
        } else {
            setVisibleDialog({ ...visibleDialog, verify: false, backup: true })
        }
    }

    return (
        <>
            <SettingButton size="large" onClick={onBackup}>
                {t.settings_button_backup()}
            </SettingButton>
            {visibleDialog.backup ? (
                <BackupDialog
                    local={localMode}
                    params={params}
                    open={visibleDialog.backup}
                    merged={merged}
                    onClose={() => setVisibleDialog({ ...visibleDialog, backup: false })}
                />
            ) : null}

            <BackupModeSelectDialog
                open={visibleDialog.mode}
                onClose={() => setVisibleDialog({ ...visibleDialog, mode: false })}
                onSelect={onSelectMode}
            />
            {visibleDialog.verify ? (
                <CloudBackupVerifyDialog
                    open={visibleDialog.verify}
                    onClose={() => setVisibleDialog({ ...visibleDialog, verify: false })}
                    onNext={handleVerified}
                />
            ) : null}

            {cloudFileInfo && params ? (
                <CloudBackupMergeDialog
                    account={params.account}
                    info={cloudFileInfo}
                    open={visibleDialog.merge}
                    onClose={() => setVisibleDialog({ ...visibleDialog, merge: false })}
                    onMerged={(merged) => {
                        setMerged(merged)
                        setVisibleDialog({ ...visibleDialog, merge: false, backup: true })
                    }}
                />
            ) : null}
        </>
    )
}
