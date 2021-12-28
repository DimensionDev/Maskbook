import { MenuItem } from '@mui/material'
import { useLanguage } from '../api'
import { Services } from '../../../API'
import SettingSelect from './SettingSelect'
import { LanguageOptions } from '@masknet/public-api'
import { useDashboardI18N } from '../../../locales'

export default function LanguageSetting() {
    const lang = useLanguage()
    const handleChange = (event: any) => {
        Services.Settings.setLanguage(event.target.value)
    }
    const t = useDashboardI18N()

    // cspell:ignore lengua, española, française, русский язык, زبان فارسی
    // Some languages are not ready to ship to the users. Only display them in beta/insider version.
    return (
        <SettingSelect value={lang} onChange={handleChange}>
            <MenuItem value={LanguageOptions.__auto__}>{t.settings_language_auto()}</MenuItem>
            <MenuItem value={LanguageOptions.enUS}>English</MenuItem>
            <MenuItem value={LanguageOptions.zhCN}>简体中文</MenuItem>
            <MenuItem value={LanguageOptions.zhTW}>繁体中文</MenuItem>
            <MenuItem value={LanguageOptions.jaJP}>日本語</MenuItem>
            <MenuItem value={LanguageOptions.koKR}>한국인</MenuItem>
        </SettingSelect>
    )
}
