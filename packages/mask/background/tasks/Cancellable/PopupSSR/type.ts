import type { LanguageOptions } from '@masknet/public-api'
import type { Account } from '@masknet/shared'
import type { EnhanceableSite } from '@masknet/shared-base'

export interface PopupSSR_Props {
    language: LanguageOptions
    currentFingerPrint: string | undefined
    hasPersona: boolean
    avatar: string | null | undefined
    nickname: string | undefined
    linkedProfilesCount: number
    networks: EnhanceableSite[]
    accounts: Account[] | undefined
}
