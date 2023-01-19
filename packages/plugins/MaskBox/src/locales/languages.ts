// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
// Default fallback language in a family of languages are chosen by the alphabet order
// To overwrite this, please overwrite packages/scripts/src/locale-kit-next/index.ts
import en_US from './en-US.json'
import es_ES from './es-ES.json'
import fa_IR from './fa-IR.json'
import fr_FR from './fr-FR.json'
import it_IT from './it-IT.json'
import ja_JP from './ja-JP.json'
import ko_KR from './ko-KR.json'
import qya_AA from './qya-AA.json'
import ru_RU from './ru-RU.json'
import zh_CN from './zh-CN.json'
import zh_TW from './zh-TW.json'
export const languages = {
    en: en_US,
    es: es_ES,
    fa: fa_IR,
    fr: fr_FR,
    it: it_IT,
    ja: ja_JP,
    ko: ko_KR,
    qy: qya_AA,
    ru: ru_RU,
    'zh-CN': zh_CN,
    zh: zh_TW,
}
// @ts-ignore
if (import.meta.webpackHot) {
    // @ts-ignore
    import.meta.webpackHot.accept(
        [
            './en-US.json',
            './es-ES.json',
            './fa-IR.json',
            './fr-FR.json',
            './it-IT.json',
            './ja-JP.json',
            './ko-KR.json',
            './qya-AA.json',
            './ru-RU.json',
            './zh-CN.json',
            './zh-TW.json',
        ],
        () =>
            globalThis.dispatchEvent?.(
                new CustomEvent('MASK_I18N_HMR', {
                    detail: [
                        'com.maskbook.box',
                        {
                            en: en_US,
                            es: es_ES,
                            fa: fa_IR,
                            fr: fr_FR,
                            it: it_IT,
                            ja: ja_JP,
                            ko: ko_KR,
                            qy: qya_AA,
                            ru: ru_RU,
                            'zh-CN': zh_CN,
                            zh: zh_TW,
                        },
                    ],
                }),
            ),
    )
}
