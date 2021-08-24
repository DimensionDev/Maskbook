import SettingItem from './SettingItem'
import { SettingsBackupIcon } from '@masknet/icons'
import BackupSetting from './BackupSetting'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState, useEffect } from 'react'
import { useDashboardI18N } from '../../../locales'

export default function BackupSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [desc, setDesc] = useState(t.settings_global_backup_desc())

    useEffect(() => {
        if (user.backupAt) {
            const method = user.backupMethod === 'local' ? t.settings_local_backup() : t.settings_cloud_backup()
            const last = t.settings_global_backup_last({ backupMethod: method, backupAt: user.backupAt })

            setDesc(last)
        }
    }, [user.backupAt])

    return (
        <SettingItem icon={<SettingsBackupIcon />} title={t.settings_global_backup_title()} desc={desc}>
            <BackupSetting />
        </SettingItem>
    )
}
