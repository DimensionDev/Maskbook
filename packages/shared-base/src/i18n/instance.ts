import { i18n } from '@lingui/core'
import { LanguageOptions } from '@masknet/public-api'
import { debounce, type DebouncedFunc } from 'lodash-es'

if (process.env.NODE_ENV === 'development') {
    if (Reflect.get(globalThis, '__mask_shared_base__')) {
        throw new Error('@masknet/shared-base initialized twice. Please check your code.')
    }

    Reflect.defineProperty(globalThis, '__mask_shared_base__', { value: true })
}

// https://github.com/lingui/js-lingui/issues/2021 lingui does not support fallback
const map: Record<string, string> = {
    [LanguageOptions.enUS]: 'en',
    [LanguageOptions.jaJP]: 'ja',
    [LanguageOptions.koKR]: 'ko',
    [LanguageOptions.zhCN]: 'zh-CN',
    [LanguageOptions.zhTW]: 'zh',
}
export function updateLanguage(next: LanguageOptions) {
    if (next === LanguageOptions.__auto__) {
        const result = navigator.languages
        i18n.activate(map[result[0] || LanguageOptions.enUS])
    } else {
        i18n.activate(map[next])
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
