import SettingItem from './SettingItem.js'
import { Icons } from '@masknet/icons'
import BackupSetting from './BackupSetting.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext, useState, useEffect } from 'react'
import { useDashboardI18N } from '../../../locales/index.js'

export default function BackupSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    const [desc, setDesc] = useState(t.settings_global_backup_desc())

    useEffect(() => {
        if (!user.backupAt) return
        const method = user.backupMethod === 'local' ? t.settings_local_backup() : t.settings_cloud_backup()
        const last = t.settings_global_backup_last({ backupMethod: method, backupAt: user.backupAt })
        setDesc(last)
    }, [user.backupAt])

    return (
        <SettingItem
            icon={<Icons.SettingsBackup />}
            title={t.settings_global_backup_title()}
            desc={user.backupAt ? desc : t.settings_global_backup_desc()}>
            <BackupSetting />
        </SettingItem>
    )
}
