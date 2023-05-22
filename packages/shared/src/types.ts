import type { BindingProof, PersonaInformation } from '@masknet/shared-base'

export interface PersonaConnectStatus {
    action?: (
        target?: string | undefined,
        position?: 'center' | 'top-right' | undefined,
        enableVerify?: boolean,
        direct?: boolean,
    ) => void
    currentPersona?: PersonaInformation
    connected?: boolean
    hasPersona?: boolean
    verified?: boolean
    proof?: BindingProof[]
}
