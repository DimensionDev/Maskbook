import { MenuItem } from '@material-ui/core'
import { useLanguage } from '../api'
import { Services } from '../../../API'
import SettingSelect from './SettingSelect'
import { Language } from '@masknet/theme'

export default function LanguageSetting() {
    const lang = useLanguage()
    const handleChange = (event: any) => {
        Services.Settings.setLanguage(event.target.value)
    }

    return (
        <SettingSelect value={lang} onChange={handleChange}>
            <MenuItem value={Language.zh}>中文</MenuItem>
            <MenuItem value={Language.en}>English</MenuItem>
            <MenuItem value={Language.ko}>한국인</MenuItem>
            <MenuItem value={Language.ja}>日本語</MenuItem>
        </SettingSelect>
    )
}
