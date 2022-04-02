import { useValueRef } from '@masknet/shared-base-ui'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { jaJP, koKR, zhTW, zhCN, enUS, Localization } from '@mui/material/locale/index'
import { languageSettings } from '../../settings/settings'

export function useThemeLanguage(): [loc: Localization, RTL: boolean] {
    let language = useValueRef(languageSettings)
    // TODO: support auto language
    if (language === LanguageOptions.__auto__) language = LanguageOptions.enUS

    const displayLanguage = language as any as SupportedLanguages

    const langs: Record<SupportedLanguages, Localization> = {
        [SupportedLanguages.enUS]: enUS,
        [SupportedLanguages.jaJP]: jaJP,
        [SupportedLanguages.koKR]: koKR,
        [SupportedLanguages.zhTW]: zhTW,
        [SupportedLanguages.zhCN]: zhCN,
    }
    return [langs[displayLanguage] || enUS, false]
}
