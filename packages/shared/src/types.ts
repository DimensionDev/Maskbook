import type { BindingProof, PersonaInformation } from '@masknet/shared-base'

export interface PersonaConnectStatus {
    action?: (
        target?: string  ,
        position?: 'center' | 'top-right'  ,
        enableVerify?: boolean,
        direct?: boolean,
    ) => void
    currentPersona?: PersonaInformation
    connected?: boolean
    hasPersona?: boolean
    verified?: boolean
    proof?: BindingProof[]
}

export interface PersonaPerSiteConnectStatus {
    isSiteConnectedToCurrentPersona: boolean
    currentPersonaPublicKey: string
    currentSiteConnectedPersonaPublicKey: string
}

export interface PersonaAvatarData {
    sign: string
    imageUrl: string
    updateAt: number
}
