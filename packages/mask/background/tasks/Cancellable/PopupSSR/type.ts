import type { LanguageOptions } from '@masknet/public-api'

export interface PopupSSR_Props {
    language: LanguageOptions
    currentFingerPrint: string | undefined
    hasPersona: boolean
    avatar: string | null | undefined
    nickname: string | undefined
    linkedProfilesCount: number
}
