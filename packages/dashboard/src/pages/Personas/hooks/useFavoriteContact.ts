import { useAsyncFn } from 'react-use'
import type { ProfileIdentifier, PersonaInformation } from '@masknet/shared'
import { Services } from '../../../API'

export function useAddContactToFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, 1)
    }, [])
}

export function useRemoveContactFromFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, 0)
    })
}
