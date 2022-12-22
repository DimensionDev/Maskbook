import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(userId?: string, platform?: NextIDPlatform) {
    const { getNextIDPlatform, MaskMessages } = useSNSAdaptorContext()
    const asyncRetry = useAsyncRetry(async () => {
        const _platform = platform ?? getNextIDPlatform()
        if (!_platform || !userId) return EMPTY_LIST
        return NextIDProof.queryAllExistedBindingsByPlatform(_platform, userId)
    }, [platform, userId])
    useEffect(() => MaskMessages.events.ownProofChanged.on(asyncRetry.retry), [asyncRetry.retry])
    return asyncRetry
}
