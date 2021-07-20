import { MenuItem } from '@material-ui/core'
import { Services } from '../../../API'
import { useAppearance } from '../../Personas/api'
import { Appearance } from '@masknet/theme'

import SettingSelect from './SettingSelect'

export default function AppearanceSetting() {
    const mode = useAppearance()
    const handleChange = (event: any) => {
        Services.Settings.setTheme(event.target.value)
    }

    return (
        <SettingSelect value={mode} onChange={handleChange}>
            <MenuItem value={Appearance.default}>Follow system settings</MenuItem>
            <MenuItem value={Appearance.light}>Light</MenuItem>
            <MenuItem value={Appearance.dark}>Dark</MenuItem>
        </SettingSelect>
    )
}
