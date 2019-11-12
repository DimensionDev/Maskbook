import { ProfileRecord, PersonaRecord, LinkedProfileDetails } from './Persona.db'
import { ReadonlyIdentifierMap } from '../IdentifierMap'
import { ProfileIdentifier } from '../type'

type TypedOmit<T, Q extends keyof T> = Omit<T, Q>
export interface Profile extends Readonly<TypedOmit<ProfileRecord, 'localKey' | 'linkedPersona'>> {
    readonly linkedPersona?: Persona
    readonly avatar?: string
}

export interface Persona extends TypedOmit<PersonaRecord, 'localKey' | 'publicKey' | 'privateKey' | 'linkedProfiles'> {
    readonly linkedProfiles: ReadonlyIdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    readonly hasPrivateKey: boolean
}
