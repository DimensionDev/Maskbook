import { useAsyncRetry } from 'react-use'
import { NextIDAction, NextIDPlatform } from '@masknet/shared-base'
import Services from '../../../extension/service'

export const useBindPayload = (action: NextIDAction, address?: string, currentIdentifier?: string) => {
    return useAsyncRetry(() => {
        if (!address) return Promise.resolve(undefined)
        if (!currentIdentifier || !address) return Promise.resolve(undefined)
        return Services.Helper.createPersonaPayload(currentIdentifier, action, address, NextIDPlatform.Ethereum)
    }, [currentIdentifier, address])
}
