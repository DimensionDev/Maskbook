import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { jaJP, koKR, zhTW, zhCN, enUS, type Localization } from '@mui/material/locale/index.js'
import { updateLanguage } from '@masknet/shared-base'
import { startTransition, useEffect } from 'react'

const langs: Record<SupportedLanguages, Localization> = {
    [SupportedLanguages.enUS]: enUS,
    [SupportedLanguages.jaJP]: jaJP,
    [SupportedLanguages.koKR]: koKR,
    [SupportedLanguages.zhTW]: zhTW,
    [SupportedLanguages.zhCN]: zhCN,
}
export function useThemeLanguage(_language: LanguageOptions): [loc: Localization, RTL: boolean] {
    let language = _language
    useEffect(() => {
        if (language !== LanguageOptions.__auto__) return
        startTransition(() => updateLanguage(language))
    }, [language])

    if (language === LanguageOptions.__auto__) {
        // we've scheduled an update above.
        language = LanguageOptions.enUS
    }

    const displayLanguage = language as any as SupportedLanguages
    return [langs[displayLanguage] || enUS, false]
}
