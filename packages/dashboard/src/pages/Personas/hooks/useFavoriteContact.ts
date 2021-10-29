import { useAsyncFn } from 'react-use'
import type { PersonaInformation, ProfileIdentifier } from '@masknet/shared'
import { RelationFavor } from '@masknet/shared'
import { Services } from '../../../API'

export function useAddContactToFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, RelationFavor.COLLECTED)
    }, [])
}

export function useRemoveContactFromFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, RelationFavor.UNCOLLECTED)
    })
}
