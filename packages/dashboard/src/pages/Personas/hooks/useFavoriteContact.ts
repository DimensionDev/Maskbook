import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'
import { RelationFavor, type PersonaInformation, type ProfileIdentifier } from '@masknet/shared-base'
import { Services } from '../../../API.js'

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
