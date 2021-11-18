import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'
import type { PersonaInformation, ProfileIdentifier } from '@masknet/shared'
import { RelationFavor } from '@masknet/shared'
import { Services } from '../../../API'

export function useAddContactToFavorite(): AsyncFnReturn<
    (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => Promise<void>
> {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, RelationFavor.COLLECTED)
    }, [])
}

export function useRemoveContactFromFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier, currentPersona: PersonaInformation) => {
        await Services.Identity.updateRelation(identifier, currentPersona.identifier, RelationFavor.UNCOLLECTED)
    })
}
