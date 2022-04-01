import type { PersonaIdentifier, PersonaInformation } from '@masknet/shared-base'
import type { ProfileInformationWithNextID } from '../../../services/identity/profile/query'

export interface PopupSSR_Props {
    personas: PersonaInformation[] | undefined
    currentPersona: PersonaIdentifier | undefined
    profilesWithNextID: ProfileInformationWithNextID[]
}
