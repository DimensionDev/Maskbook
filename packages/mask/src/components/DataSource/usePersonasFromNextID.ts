import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { MaskMessages } from '../../utils'
import { activatedSocialNetworkUI } from '../../social-network'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(
    userId?: string,
    platform = activatedSocialNetworkUI.configuration.nextIDConfig?.platform,
) {
    const asyncRetry = useAsyncRetry(async () => {
        if (!platform || !userId) return EMPTY_LIST
        return NextIDProof.queryAllExistedBindingsByPlatform(platform, userId)
    }, [platform, userId])
    useEffect(() => MaskMessages.events.ownProofChanged.on(asyncRetry.retry), [asyncRetry.retry])
    return asyncRetry
}
