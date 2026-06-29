import { i18n } from '@lingui/core'
import { LanguageOptions } from '@masknet/public-api'

if (process.env.NODE_ENV === 'development') {
    if (Reflect.get(globalThis, '__mask_shared_base__')) {
        throw new Error('@masknet/shared-base initialized twice. Please check your code.')
    }

    Reflect.defineProperty(globalThis, '__mask_shared_base__', { value: true })
}

function detectLanguage(language: string) {
    if (language.startsWith('en')) return 'en'
    if (language.startsWith('ja')) return 'ja'
    if (language.startsWith('ko')) return 'ko'
    if (language === 'zh-TW') return 'zh'
    if (language.startsWith('zh')) return 'zh-CN'
    return undefined
}
export function updateLanguage(next: LanguageOptions) {
    if (next === LanguageOptions.__auto__) {
        const result = navigator.languages.map(detectLanguage).find(Boolean)
        i18n.activate(result || 'en')
    } else {
        i18n.activate(detectLanguage(next) || 'en')
    }
}
