import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import type { User } from '../types'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { PluginPetRPC } from '../messages'
import { useAccount } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const whoAmI = useLastRecognizedIdentity()
    useEffect(() => {
        if (!(account && whoAmI?.identifier?.userId)) return
        setUser({ userId: whoAmI.identifier.userId, address: account })
    }, [account, whoAmI])
    return user
}

export function useCurrentVisitingUser(flag?: number) {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const identity = useCurrentVisitingIdentity()
    useAsync(async () => {
        const userId = location.href?.endsWith(identity.identifier?.userId ?? '')
            ? identity.identifier?.userId ?? ''
            : ''
        try {
            const address = (await PluginPetRPC.getUserAddress(identity.identifier?.userId ?? '')) ?? ''
            setUser({
                userId,
                address,
            })
        } catch {
            setUser({
                userId,
                address: '',
            })
        }
    }, [identity, flag, location.href])
    return user
}
