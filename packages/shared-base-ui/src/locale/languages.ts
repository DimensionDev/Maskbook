import en_US from './en-US.json' with { type: 'json' }
import ja_JP from './ja-JP.json' with { type: 'json' }
import ko_KR from './ko-KR.json' with { type: 'json' }
import zh_CN from './zh-CN.json' with { type: 'json' }
import zh_TW from './zh-TW.json' with { type: 'json' }
export const languages = {
    en: en_US,
    ja: ja_JP,
    ko: ko_KR,
    'zh-CN': zh_CN,
    zh: zh_TW,
}
import { createI18NBundle } from '@masknet/shared-base'
export const addI18N = createI18NBundle(languages as any)
// @ts-ignore
import.meta.webpackHot?.accept(['./en-US.json', './ja-JP.json', './ko-KR.json', './zh-CN.json', './zh-TW.json'], () =>
    globalThis.dispatchEvent?.(
        new CustomEvent('MASK_I18N_HMR_LINGUI', {
            detail: { en: en_US, ja: ja_JP, ko: ko_KR, 'zh-CN': zh_CN, zh: zh_TW },
        }),
    ),
)
