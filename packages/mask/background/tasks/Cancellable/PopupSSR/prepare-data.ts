import { queryOwnedPersonaInformation, queryCurrentPersona_internal } from '../../../services/identity'
import { queryOwnedProfileInformationWithNextID_internal } from '../../../services/identity/profile/query'
import { getLanguagePreference } from '../../../services/settings'
import type { PopupSSR_Props } from './type'

export async function prepareSSR(): Promise<PopupSSR_Props> {
    const language = getLanguagePreference()
    const personas = await queryOwnedPersonaInformation()
    const currentPersona = await queryCurrentPersona_internal(personas)
    const profilesWithNextID = await queryOwnedProfileInformationWithNextID_internal(personas, currentPersona)

    return {
        profilesWithNextID,
        currentPersona,
        personas,
        language: await language,
    }
}
