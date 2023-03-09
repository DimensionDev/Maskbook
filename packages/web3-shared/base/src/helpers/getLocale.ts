import { zhTW, enUS, ja, zhCN, ko } from 'date-fns/locale'
import { SupportedLanguages } from '@masknet/public-api'

export function getLocale(lang?: SupportedLanguages) {
    if (lang === SupportedLanguages.enUS) return enUS
    if (lang === SupportedLanguages.jaJP) return ja
    if (lang === SupportedLanguages.zhTW) return zhTW
    if (lang === SupportedLanguages.zhCN) return zhCN
    if (lang === SupportedLanguages.koKR) return ko
    return enUS
}
