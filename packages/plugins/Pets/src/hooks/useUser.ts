import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Web3Storage } from '@masknet/web3-providers'
import { PetsPluginID } from '../constants.js'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '@masknet/plugin-infra/content-script'

export function useUser() {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const whoAmI = useLastRecognizedIdentity()

    return useMemo(() => {
        if (!account || !whoAmI || !whoAmI.identifier || whoAmI.identifier?.userId === '$unknown') return
        return {
            userId: whoAmI.identifier.userId,
            address: account,
        }
    }, [account, whoAmI])
}

const DEFAULT_USER = { userId: '', address: '' }

export function useCurrentVisitingUser(flag?: number) {
    const identity = useCurrentVisitingIdentity()
    const { value: user = DEFAULT_USER } = useAsync(async () => {
        const userId = location.href?.endsWith(identity?.identifier?.userId ?? '')
            ? identity?.identifier?.userId ?? ''
            : ''
        try {
            if (!userId || userId === '$unknown') return DEFAULT_USER
            const storage = Web3Storage.createKVStorage(PetsPluginID)
            const address = (await storage.get<string>(userId)) ?? ''
            return {
                userId,
                address,
            }
        } catch {
            return {
                userId,
                address: '',
            }
        }
    }, [identity, flag, location.href])
    return user
}
