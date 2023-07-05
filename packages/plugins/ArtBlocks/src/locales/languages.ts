// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from './en-US.json'
import ko_KR from './ko-KR.json'
import qya_AA from './qya-AA.json'
import zh_CN from './zh-CN.json'
export const languages = {
    en: en_US,
    ko: ko_KR,
    qy: qya_AA,
    'zh-CN': zh_CN,
}
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept(
        ['./en-US.json', './ko-KR.json', './qya-AA.json', './zh-CN.json'],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR', {
                    detail: ['io.artblocks', { en: en_US, ko: ko_KR, qy: qya_AA, 'zh-CN': zh_CN }],
                }),
            ),
    )
}
