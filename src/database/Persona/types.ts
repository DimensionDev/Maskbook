import type { ProfileRecord, PersonaRecord, LinkedProfileDetails } from './Persona.db'
import type { ReadonlyIdentifierMap, IdentifierMap } from '../IdentifierMap'
import type { ProfileIdentifier, PersonaIdentifier } from '../type'
import type {
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    AESJsonWebKey,
} from '../../modules/CryptoAlgorithm/interfaces/utils'

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

export interface PersonaWithPrivateKey
    extends Omit<PersonaRecord, 'privateKey'>,
        Required<Pick<PersonaRecord, 'privateKey'>> {}
