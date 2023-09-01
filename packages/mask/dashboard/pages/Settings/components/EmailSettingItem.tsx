import { useDashboardI18N } from '../../../locales/index.js'
import SettingItem from './SettingItem.js'
import EmailSetting from './EmailSetting.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext } from 'react'
import { Icons } from '@masknet/icons'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<Icons.SettingsEmail />}
            title={t.settings_email_title()}
            desc={user.email ? user.email : t.settings_email_desc()}>
            <EmailSetting />
        </SettingItem>
    )
}
