import SettingButton from './SettingButton'
import { useDashboardI18N } from '../../../locales'
import { useNavigate } from 'react-router-dom'
import { DashboardRoutes } from '@masknet/shared-base'

export default function RestoreSetting() {
    const t = useDashboardI18N()
    const navigate = useNavigate()

    const onRecovery = () => {
        navigate(DashboardRoutes.SignIn, { state: { from: DashboardRoutes.Settings } })
    }

    return (
        <SettingButton size="large" onClick={onRecovery}>
            {t.settings_button_recovery()}
        </SettingButton>
    )
}
