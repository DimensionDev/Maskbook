// This file is auto generated. DO NOT EDIT
// Run `npx gulp sync-languages` to regenerate.
import en_US from './en-US.json'
import ja_JP from './ja-JP.json'
import ko_KR from './ko-KR.json'
import qya_AA from './qya-AA.json'
import zh_CN from './zh-CN.json'
import zh_TW from './zh-TW.json'

export * from './i18n_generated'
export const languages = {
    'en-US': en_US,
    'ja-JP': ja_JP,
    'ko-KR': ko_KR,
    'qya-AA': qya_AA,
    'zh-CN': zh_CN,
    'zh-TW': zh_TW,
}
import { createI18NBundle } from '@masknet/shared'
export const addDashboardI18N = createI18NBundle('dashboard', languages)
