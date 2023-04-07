import { useMemo } from 'react'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWeb3State } from '@masknet/web3-hooks-base'
import { PetsPluginID } from '../constants.js'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI.js'

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
    const { Storage } = useWeb3State()
    const { value: user = DEFAULT_USER } = useAsync(async () => {
        const userId = location.href?.endsWith(identity.identifier?.userId ?? '')
            ? identity.identifier?.userId ?? ''
            : ''
        try {
            if (!Storage || !userId || userId === '$unknown') return DEFAULT_USER
            const storage = Storage.createKVStorage(PetsPluginID)
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
    }, [identity, flag, location.href, Storage])
    return user
}
