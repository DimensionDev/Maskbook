import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { EMPTY_LIST, MaskEvents, NextIDPlatform } from '@masknet/shared-base'
import { NextIDProof } from '@masknet/web3-providers'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'

/**
 * Get all personas bound with the given identity from NextID service
 */
export function usePersonasFromNextID(
    userId: string,
    platform: NextIDPlatform,
    exact?: boolean,
    message?: WebExtensionMessage<MaskEvents>,
) {
    const { getNextIDPlatform, ownProofChanged } = useSNSAdaptorContext()
    const asyncRetry = useAsyncRetry(async () => {
        const _platform = platform ?? getNextIDPlatform()
        if (!_platform || !userId) return EMPTY_LIST
        return NextIDProof.queryAllExistedBindingsByPlatform(_platform, userId, exact)
    }, [platform, userId, exact])
    useEffect(() => message?.events.ownPersonaChanged.on(asyncRetry.retry), [asyncRetry.retry])
    return asyncRetry
}
