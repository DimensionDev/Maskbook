import type { ProfileIdentifier } from '@masknet/shared-base'
import type { PersonaRecord, LinkedProfileDetails } from '../../../background/database/persona/db'

type TypedOmit<T, Q extends keyof T> = Omit<T, Q>

export interface Persona extends TypedOmit<PersonaRecord, 'localKey' | 'publicKey' | 'privateKey' | 'linkedProfiles'> {
    readonly linkedProfiles: ReadonlyMap<ProfileIdentifier, LinkedProfileDetails>
    readonly hasPrivateKey: boolean
    readonly fingerprint: string
}
