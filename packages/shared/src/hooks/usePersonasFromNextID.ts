import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, MaskMessages, type NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(userId: string, platform: NextIDPlatform, exact?: boolean) {
    const asyncRetry = useAsyncRetry(async () => {
        if (!platform || !userId) return EMPTY_LIST
        console.log(platform)
        return NextIDProof.queryAllExistedBindingsByPlatform(platform, userId, exact)
    }, [platform, userId, exact])
    useEffect(() => MaskMessages.events.ownProofChanged.on(asyncRetry.retry), [asyncRetry.retry])
    return asyncRetry
}
