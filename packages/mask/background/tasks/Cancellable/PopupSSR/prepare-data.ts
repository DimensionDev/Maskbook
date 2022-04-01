import { queryOwnedPersonaInformation, queryCurrentPersona_internal } from '../../../services/identity'
import { queryOwnedProfileInformationWithNextID_internal } from '../../../services/identity/profile/query'
import type { PopupSSR_Props } from './type'

export async function prepareSSR(): Promise<PopupSSR_Props> {
    const personas = await queryOwnedPersonaInformation()
    const currentPersona = await queryCurrentPersona_internal(personas)
    const profilesWithNextID = await queryOwnedProfileInformationWithNextID_internal(personas, currentPersona)

    return { profilesWithNextID, currentPersona, personas }
}
