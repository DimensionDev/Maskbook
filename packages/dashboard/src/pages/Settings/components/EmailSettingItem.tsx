import { useDashboardI18N } from '../../../locales'
import SettingItem from './SettingItem'
import EmailSetting from './EmailSetting'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'
import { Icon } from '@masknet/icons'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<Icon type="settingsEmail" />}
            title={t.settings_email_title()}
            desc={user.email ? user.email : t.settings_email_desc()}>
            <EmailSetting />
        </SettingItem>
    )
}
