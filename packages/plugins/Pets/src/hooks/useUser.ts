import { useMemo } from 'react'
import { useAsyncRetry } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Web3Storage } from '@masknet/web3-providers'
import { PetsPluginID } from '../constants.js'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'

export function useUser() {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const whoAmI = useLastRecognizedIdentity()

    return useMemo(() => {
        if (!account || !whoAmI?.identifier || whoAmI.identifier?.userId === '$unknown') return
        return {
            userId: whoAmI.identifier.userId,
            address: account,
        }
    }, [account, whoAmI])
}

export const DEFAULT_USER = { userId: '', address: '' }

export function useCurrentVisitingUser() {
    const identity = useCurrentVisitingIdentity()
    return useAsyncRetry(async () => {
        const userId =
            location.href.endsWith(identity?.identifier?.userId ?? '') ? (identity?.identifier?.userId ?? '') : ''
        try {
            if (!userId || userId === '$unknown') return DEFAULT_USER
            const storage = Web3Storage.createKVStorage(PetsPluginID)
            const address = await storage.get<string>(userId)
            return {
                userId,
                address: address ?? '',
            }
        } catch {
            return {
                userId,
                address: '',
            }
        }
    }, [identity, location.href])
}
