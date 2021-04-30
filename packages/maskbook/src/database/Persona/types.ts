import type { PersonaRecord } from '@dimensiondev/maskbook-shared'
export type { Profile, Persona } from '@dimensiondev/maskbook-shared'

export interface PersonaWithPrivateKey
    extends Omit<PersonaRecord, 'privateKey'>,
        Required<Pick<PersonaRecord, 'privateKey'>> {}
