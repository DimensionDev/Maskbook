import { MenuItem } from '@material-ui/core'
import { Services } from '../../../API'
import { useAppearance } from '../../Personas/api'

import SettingSelect from './SettingSelect'

export default function AppearanceSetting() {
    let mode = useAppearance()
    const handleChange = (event: any) => {
        Services.Settings.setTheme(event.target.value)
    }

    return (
        <SettingSelect value={mode} onChange={handleChange}>
            <MenuItem value="default">Follow system settings</MenuItem>
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
        </SettingSelect>
    )
}
