import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { NextIDAction, NextIDPlatform } from '@masknet/web3-shared-base'

export const useBindPayload = (action: NextIDAction, address?: string, currentIdentifier?: string) => {
    return useAsyncRetry(() => {
        if (!address) return Promise.resolve(undefined)
        if (!currentIdentifier || !address) return Promise.resolve(undefined)
        return NextIDProof.createPersonaPayload(currentIdentifier, action, address, NextIDPlatform.Ethereum)
    }, [currentIdentifier, address])
}
