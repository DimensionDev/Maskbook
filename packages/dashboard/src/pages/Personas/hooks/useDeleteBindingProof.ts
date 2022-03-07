import type { ECKeyIdentifier } from '@masknet/shared-base'
import { useAsyncFn } from 'react-use'

export function useDeleteBound(public_key: string) {
    console.log(public_key, 'sss')
    return useAsyncFn(async (identifier: ECKeyIdentifier, network) => {
        console.log('ssss', identifier, network, public_key)
    })
}
