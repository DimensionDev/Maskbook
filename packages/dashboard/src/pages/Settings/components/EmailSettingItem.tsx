import { useDashboardI18N } from '../../../locales'
import SettingItem from './SettingItem'
import EmailSetting from './EmailSetting'
import PermIdentityIcon from '@material-ui/icons/PermIdentity'
import { UserContext } from '../hooks/UserContext'
import { useContext } from 'react'

export default function PasswordSettingItem() {
    const t = useDashboardI18N()
    const { user } = useContext(UserContext)
    return (
        <SettingItem
            icon={<PermIdentityIcon />}
            title={t.settigns_email_title()}
            desc={user.email ? user.email : t.settigns_email_desc()}>
            <EmailSetting />
        </SettingItem>
    )
}
