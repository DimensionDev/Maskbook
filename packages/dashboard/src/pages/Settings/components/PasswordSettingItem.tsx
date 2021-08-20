import { useDashboardI18N } from '../../../locales'
import SettingItem from './SettingItem'
import PasswordSetting from './PasswordSetting'
import VpnKeyIcon from '@material-ui/icons/VpnKey'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<VpnKeyIcon />}
            title={t.settings_change_passowrd_title()}
            desc={user.backupPassword ? t.settings_change_passowrd_desc() : t.settings_change_passowrd_not_set()}
            error={!user.backupPassword}>
            <PasswordSetting />
        </SettingItem>
    )
}
