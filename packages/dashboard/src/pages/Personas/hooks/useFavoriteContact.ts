import { useAsyncFn } from 'react-use'
import type { ProfileIdentifier } from '@masknet/shared'
import { Services } from '../../../API'

export function useAddContactToFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier) => {
        Services.Identity.updateProfileInfo(identifier, {
            favorite: true,
        })
    }, [])
}

export function useRemoveContactFromFavorite() {
    return useAsyncFn(async (identifier: ProfileIdentifier) => {
        Services.Identity.updateProfileInfo(identifier, {
            favorite: false,
        })
    })
}
