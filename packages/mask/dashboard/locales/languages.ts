// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from './en-US.json'
import ja_JP from './ja-JP.json'
import ko_KR from './ko-KR.json'
import qya_AA from './qya-AA.json'
import zh_CN from './zh-CN.json'
import zh_TW from './zh-TW.json'
import lingui_en_US from '../../shared-ui/locale/en-US.json'
import lingui_ja_JP from '../../shared-ui/locale/ja-JP.json'
import lingui_ko_KR from '../../shared-ui/locale/ko-KR.json'
import lingui_zh_CN from '../../shared-ui/locale/zh-CN.json'
import lingui_zh_TW from '../../shared-ui/locale/zh-TW.json'
export const languages = {
    en: en_US,
    ja: ja_JP,
    ko: ko_KR,
    qy: qya_AA,
    'zh-CN': zh_CN,
    zh: zh_TW,
}
export const linguiLanguages = {
    en: lingui_en_US,
    ja: lingui_ja_JP,
    ko: lingui_ko_KR,
    'zh-CN': lingui_zh_CN,
    zh: lingui_zh_TW,
}
import { createI18NBundle } from '@masknet/shared-base'
export const addDashboardI18N = createI18NBundle('dashboard', [languages, linguiLanguages as any])
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept(
        ['./en-US.json', './ja-JP.json', './ko-KR.json', './qya-AA.json', './zh-CN.json', './zh-TW.json'],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR', {
                    detail: ['dashboard', { en: en_US, ja: ja_JP, ko: ko_KR, qy: qya_AA, 'zh-CN': zh_CN, zh: zh_TW }],
                }),
            ),
    )
    // @ts-ignore
    import.meta.webpackHot.accept(
        [
            '../../shared-ui/locale/en-US.json',
            '../../shared-ui/locale/ja-JP.json',
            '../../shared-ui/locale/ko-KR.json',
            '../../shared-ui/locale/zh-CN.json',
            '../../shared-ui/locale/zh-TW.json',
        ],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR_LINGUI', {
                    detail: {
                        en: lingui_en_US,
                        ja: lingui_ja_JP,
                        ko: lingui_ko_KR,
                        'zh-CN': lingui_zh_CN,
                        zh: lingui_zh_TW,
                    },
                }),
            ),
    )
}
