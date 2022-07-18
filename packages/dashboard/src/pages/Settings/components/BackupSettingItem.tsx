import SettingItem from './SettingItem'
import { Icon } from '@masknet/icons'
import BackupSetting from './BackupSetting'
import { UserContext } from '../hooks/UserContext'
import { useContext, useState, useEffect } from 'react'
import { useDashboardI18N } from '../../../locales'

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
            icon={<Icon type="settings" />}
            title={t.settings_global_backup_title()}
            desc={user.backupAt ? desc : t.settings_global_backup_desc()}>
            <BackupSetting />
        </SettingItem>
    )
}
