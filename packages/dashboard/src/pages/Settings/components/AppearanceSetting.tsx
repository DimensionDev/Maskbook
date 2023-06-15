import { MenuItem, type SelectChangeEvent } from '@mui/material'
import { Appearance } from '@masknet/public-api'
import { Services } from '../../../API.js'
import { useAppearance } from '../../Personas/api.js'
import SettingSelect from './SettingSelect.js'
import { useDashboardI18N } from '../../../locales/index.js'

function handleChange(event: SelectChangeEvent<Appearance>) {
    Services.Settings.setTheme(event.target.value as Appearance)
}
export default function AppearanceSetting() {
    const t = useDashboardI18N()
    const mode = useAppearance()

    return (
        <SettingSelect value={mode} onChange={handleChange}>
            <MenuItem value={Appearance.default}>{t.settings_appearance_default()}</MenuItem>
            <MenuItem value={Appearance.light}>{t.settings_appearance_light()}</MenuItem>
            <MenuItem value={Appearance.dark}>{t.settings_appearance_dark()}</MenuItem>
        </SettingSelect>
    )
}
