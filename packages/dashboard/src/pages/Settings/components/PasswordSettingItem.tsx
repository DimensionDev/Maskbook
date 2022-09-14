import { useDashboardI18N } from '../../../locales/index.js'
import SettingItem from './SettingItem.js'
import PasswordSetting from './PasswordSetting.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext } from 'react'
import { Icons } from '@masknet/icons'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<Icons.SettingsPassword />}
            title={t.settings_change_password_title()}
            desc={user.backupPassword ? t.settings_change_password_desc() : t.settings_change_password_not_set()}
            error={!user.backupPassword}>
            <PasswordSetting />
        </SettingItem>
    )
}
