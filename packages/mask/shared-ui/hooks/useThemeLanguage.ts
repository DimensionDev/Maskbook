import { LanguageOptions, SupportedLanguages } from '@masknet/public-api'
import { jaJP, koKR, zhTW, zhCN, enUS, type Localization } from '@mui/material/locale'
import { languageSettings, updateLanguage } from '@masknet/shared-base'
import { startTransition, useEffect } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'

const langs: Record<SupportedLanguages, Localization> = {
    [SupportedLanguages.enUS]: enUS,
    [SupportedLanguages.jaJP]: jaJP,
    [SupportedLanguages.koKR]: koKR,
    [SupportedLanguages.zhTW]: zhTW,
    [SupportedLanguages.zhCN]: zhCN,
}
export function useThemeLanguage(): [loc: Localization, RTL: boolean] {
    const _language = useValueRef(languageSettings)
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
