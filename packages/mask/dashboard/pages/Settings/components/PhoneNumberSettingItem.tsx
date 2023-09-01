import { useDashboardI18N } from '../../../locales/index.js'
import SettingItem from './SettingItem.js'
import PhoneNumberSetting from './PhoneNumberSetting.js'
import { UserContext } from '../hooks/UserContext.js'
import { useContext } from 'react'
import { Icons } from '@masknet/icons'

export default function PhoneNumberSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<Icons.SettingsPhone />}
            title={t.settings_phone_number_title()}
            desc={user.phone ? user.phone : t.settings_phone_number_desc()}>
            <PhoneNumberSetting />
        </SettingItem>
    )
}
