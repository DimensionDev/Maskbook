import { useAsyncRetry } from 'react-use'
import Services from '../../../extension/service'
import type { ECKeyIdentifier } from '@masknet/shared-base'

export const useBindPayload = (action: 'delete' | 'create', address?: string, currentIdentifier?: ECKeyIdentifier) => {
    return useAsyncRetry(() => {
        if (!address) return Promise.resolve(undefined)
        if (!currentIdentifier || !address) return Promise.resolve(undefined)
        return Services.Helper.createPersonaPayload(currentIdentifier, 'delete', address, 'ethereum')
    }, [currentIdentifier, address])
}
