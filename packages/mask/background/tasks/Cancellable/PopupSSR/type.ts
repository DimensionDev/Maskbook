import type { LanguageOptions } from '@masknet/public-api'
import type { ProfileAccount, EnhanceableSite } from '@masknet/shared-base'

export interface PopupSSR_Props {
    language: LanguageOptions
    currentFingerPrint: string | undefined
    currentPublicKeyHex: string | undefined
    hasPersona: boolean
    avatar: string | null | undefined
    nickname: string | undefined
    linkedProfilesCount: number
    networks: EnhanceableSite[]
    accounts: ProfileAccount[] | undefined
}
