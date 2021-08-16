// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
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

export * from './i18n_generated'
export const languages = {
    'en-US': en_US,
    'es-ES': es_ES,
    'fa-IR': fa_IR,
    'fr-FR': fr_FR,
    'it-IT': it_IT,
    'ja-JP': ja_JP,
    'ko-KR': ko_KR,
    'qya-AA': qya_AA,
    'ru-RU': ru_RU,
    'zh-CN': zh_CN,
    'zh-TW': zh_TW,
}
import { createI18NBundle } from '@masknet/shared'
export const addMaskI18N = createI18NBundle('mask', languages)
