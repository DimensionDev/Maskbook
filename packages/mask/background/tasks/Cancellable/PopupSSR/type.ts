import type { NextIDPlatform, PersonaInformation, ProfileInformation } from '@masknet/shared-base'

export interface PopupSSR_Props {
    personas: PersonaInformation[] | undefined
    currentPersonaIndex: number | undefined
    mergedProfiles: MergedProfileInformation[]
}

export interface MergedProfileInformation extends ProfileInformation {
    is_valid?: boolean
    identity?: string
    platform?: NextIDPlatform
}
