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
        let address = ''
        try {
            const response = await PluginPetRPC.getUserAddress(identity.identifier?.userId ?? '')
            if (response) address = response as string
        } finally {
            setUser({
                userId: identity.identifier?.userId ?? '',
                address,
            })
        }
    }, [identity, flag])
    return user
}
