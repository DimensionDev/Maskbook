import SettingButton from './SettingButton'
import { useDashboardI18N } from '../../../locales'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../../type'

export default function RestoreSetting() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const onRecovery = () => {
        navigate(RoutePaths.SignIn, { state: { from: RoutePaths.Settings } })
    }

    return <SettingButton onClick={onRecovery}>{t.settings_button_recovery()}</SettingButton>
}
