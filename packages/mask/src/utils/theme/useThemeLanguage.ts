import { useValueRef } from '@masknet/shared-base-ui'
import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { jaJP, koKR, zhTW, zhCN, enUS, Localization } from '@mui/material/locale/index'
import { languageSettings } from '../../settings/settings'
import { i18NextInstance, updateLanguage } from '@masknet/shared-base'

const langs: Record<SupportedLanguages, Localization> = {
    [SupportedLanguages.enUS]: enUS,
    [SupportedLanguages.jaJP]: jaJP,
    [SupportedLanguages.koKR]: koKR,
    [SupportedLanguages.zhTW]: zhTW,
    [SupportedLanguages.zhCN]: zhCN,
}
export function useThemeLanguage(): [loc: Localization, RTL: boolean] {
    let language = useValueRef(languageSettings)

    if (language === LanguageOptions.__auto__) {
        updateLanguage(language)
        if (Object.values(SupportedLanguages).some((x) => x === i18NextInstance.language)) {
            language = i18NextInstance.language as LanguageOptions
        }
    }

    const displayLanguage = language as any as SupportedLanguages
    return [langs[displayLanguage] || enUS, false]
}
