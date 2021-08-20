import { useDashboardI18N } from '../../../locales'
import SettingItem from './SettingItem'
import PhoneNumberSetting from './PhoneNumberSetting'
import PhoneIphoneIcon from '@material-ui/icons/PhoneIphone'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'

export default function PhoneNumberSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<PhoneIphoneIcon />}
            title={t.settings_phone_number_title()}
            desc={user.phone ? user.phone : t.settings_phone_number_desc()}>
            <PhoneNumberSetting />
        </SettingItem>
    )
}
