import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import type { UnboundedRegistry } from '@dimensiondev/holoflows-kit'
import { EMPTY_LIST, type NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(
    userId: string,
    platform: NextIDPlatform,
    ownProofChanged: UnboundedRegistry<void>,
    exact?: boolean,
) {
    const asyncRetry = useAsyncRetry(async () => {
        if (!platform || !userId) return EMPTY_LIST
        return NextIDProof.queryAllExistedBindingsByPlatform(platform, userId, exact)
    }, [platform, userId, exact])
    useEffect(() => ownProofChanged.on(asyncRetry.retry), [asyncRetry.retry, ownProofChanged])
    return asyncRetry
}
