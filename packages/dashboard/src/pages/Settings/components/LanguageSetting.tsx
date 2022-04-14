/* eslint-disable @dimensiondev/unicode/specific-set */
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
            <MenuItem value={LanguageOptions.zhCN}>&#x7B80;&#x4F53;&#x4E2D;&#x6587;</MenuItem>
            <MenuItem value={LanguageOptions.zhTW}>&#x7E41;&#x4F53;&#x4E2D;&#x6587;</MenuItem>
            <MenuItem value={LanguageOptions.jaJP}>&#x65E5;&#x672C;&#x8A9E;</MenuItem>
            <MenuItem value={LanguageOptions.koKR}>&#xD55C;&#xAD6D;&#xC778;</MenuItem>
        </SettingSelect>
    )
}
