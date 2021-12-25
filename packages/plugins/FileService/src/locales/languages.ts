// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from './en-US.json'
import ja_JP from './ja-JP.json'
import ko_KR from './ko-KR.json'
import zh_CN from './zh-CN.json'
import zh_TW from './zh-TW.json'
export const languages = {
    en: en_US,
    ja: ja_JP,
    ko: ko_KR,
    'zh-CN': zh_CN,
    zh: zh_TW,
}
// @ts-ignore
if (import.meta.webpack) {
    // @ts-ignore
    import.meta.webpackHot.accept(
        ['./en-US.json', './ja-JP.json', './ko-KR.json', './zh-CN.json', './zh-TW.json'],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR', {
                    detail: [
                        'com.maskbook.fileservice',
                        { en: en_US, ja: ja_JP, ko: ko_KR, 'zh-CN': zh_CN, zh: zh_TW },
                    ],
                }),
            ),
    )
}
