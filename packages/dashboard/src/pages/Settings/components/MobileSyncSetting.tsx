import { useDashboardI18N } from '../../../locales/index.js'
import SettingButton from './SettingButton.js'

export default function MobileSyncSetting() {
    const t = useDashboardI18N()
    return <SettingButton>{t.settings_button_sync()}</SettingButton>
}
