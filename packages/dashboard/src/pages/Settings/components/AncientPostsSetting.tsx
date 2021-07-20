import type { ChangeEvent } from 'react'
import { Services } from '../../../API'
import { useAncientPostsCompatibilityMode } from '../api'
import SettingSwitch from './SettingSwitch'

export default function AncientPostsSetting() {
    const checked = useAncientPostsCompatibilityMode()

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        Services.Settings.setAncientPostsCompatibiltyMode(event.target.checked)
    }

    return <SettingSwitch checked={checked} onChange={handleChange} />
}
