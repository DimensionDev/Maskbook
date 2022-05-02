import { useDashboardI18N } from '../../../locales'
import SettingItem from './SettingItem'
import PasswordSetting from './PasswordSetting'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'
import { Icon } from '@masknet/icons'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<Icon type="settingsPassword" />}
            title={t.settings_change_password_title()}
            desc={user.backupPassword ? t.settings_change_password_desc() : t.settings_change_password_not_set()}
            error={!user.backupPassword}>
            <PasswordSetting />
        </SettingItem>
    )
}
