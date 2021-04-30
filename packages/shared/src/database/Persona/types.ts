import type { ProfileIdentifier } from '../../Identifier/type'
import type { ReadonlyIdentifierMap } from '../../Identifier/IdentifierMap'
import type { PersonaRecord, ProfileRecord, LinkedProfileDetails } from './Persona.db'

type TypedOmit<T, Q extends keyof T> = Omit<T, Q>
export interface Profile extends Readonly<TypedOmit<ProfileRecord, 'localKey' | 'linkedPersona'>> {
    readonly linkedPersona?: Persona
    readonly avatar?: string
}
export interface Persona extends TypedOmit<PersonaRecord, 'localKey' | 'publicKey' | 'privateKey' | 'linkedProfiles'> {
    readonly linkedProfiles: ReadonlyIdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    readonly hasPrivateKey: boolean
    readonly fingerprint: string
}
