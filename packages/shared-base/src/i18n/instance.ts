import { i18n } from '@lingui/core'
import { LanguageOptions } from '@masknet/public-api'
import { debounce, type DebouncedFunc } from 'lodash-es'

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

const cache = Symbol('shared-base i18n cache')

// TODO: support lingui
export function queryRemoteI18NBundle(
    _updater: (lang: string) => Promise<Array<[namespace: string, lang: string, json: Record<string, string>]>>,
) {
    const updater: typeof _updater & { [cache]?: DebouncedFunc<() => Promise<void>> } = _updater as any
    const update = (updater[cache] ??= debounce(async () => {}, 1500))
    update()
}
