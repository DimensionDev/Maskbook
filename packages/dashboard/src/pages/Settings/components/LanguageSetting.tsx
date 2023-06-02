/* eslint-disable @masknet/unicode-specific-set */
import { MenuItem, type SelectChangeEvent } from '@mui/material'
import { useLanguage } from '../../Personas/api.js'
import { Services } from '../../../API.js'
import SettingSelect from './SettingSelect.js'
import { LanguageOptions } from '@masknet/public-api'
import { useDashboardI18N } from '../../../locales/index.js'

function onLanguageChange(event: SelectChangeEvent<LanguageOptions>) {
    Services.Settings.setLanguage(event.target.value as LanguageOptions)
}
export default function LanguageSetting() {
    const lang = useLanguage()
    const t = useDashboardI18N()

    return (
        <SettingSelect value={lang} onChange={onLanguageChange}>
            <MenuItem value={LanguageOptions.__auto__}>{t.settings_language_auto()}</MenuItem>
            <MenuItem value={LanguageOptions.enUS}>English</MenuItem>
            <MenuItem value={LanguageOptions.zhCN}>简体中文</MenuItem>
            <MenuItem value={LanguageOptions.zhTW}>繁体中文</MenuItem>
            <MenuItem value={LanguageOptions.jaJP}>日本語</MenuItem>
            <MenuItem value={LanguageOptions.koKR}>한국인</MenuItem>
        </SettingSelect>
    )
}
