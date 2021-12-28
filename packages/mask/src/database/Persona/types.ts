import type { ReadonlyIdentifierMap, ProfileIdentifier } from '@masknet/shared-base'
import type { ProfileRecord, PersonaRecord, LinkedProfileDetails } from '../../../background/database/persona/db'

type TypedOmit<T, Q extends keyof T> = Omit<T, Q>
export interface Profile extends Readonly<TypedOmit<ProfileRecord, 'localKey' | 'linkedPersona'>> {
    readonly linkedPersona?: Persona
    readonly avatar?: string
    readonly bio?: string
    readonly homepage?: string
}

export interface Persona extends TypedOmit<PersonaRecord, 'localKey' | 'publicKey' | 'privateKey' | 'linkedProfiles'> {
    readonly linkedProfiles: ReadonlyIdentifierMap<ProfileIdentifier, LinkedProfileDetails>
    readonly hasPrivateKey: boolean
    readonly fingerprint: string
}

export interface PersonaWithPrivateKey
    extends Omit<PersonaRecord, 'privateKey'>,
        Required<Pick<PersonaRecord, 'privateKey'>> {}
