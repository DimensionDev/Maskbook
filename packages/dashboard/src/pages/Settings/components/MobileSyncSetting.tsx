import { useDashboardI18N } from '../../../locales'
import SettingButton from './SettingButton'

export default function MobileSyncSetting() {
    const t = useDashboardI18N()
    return <SettingButton>{t.settings_button_sync()}</SettingButton>
}
