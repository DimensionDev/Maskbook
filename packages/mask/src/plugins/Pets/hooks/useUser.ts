import { useAsync } from 'react-use'
import { useEffect, useState } from 'react'
import { useAccount } from '@masknet/web3-shared-evm'
import type { User } from '../types'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { PluginPetRPC } from '../messages'

export function useUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const account = useAccount()
    const whoAmI = useLastRecognizedIdentity()
    useEffect(() => {
        if (!(account && whoAmI?.identifier?.userId)) return
        setUser({ userId: whoAmI.identifier.userId, address: account })
    }, [account, whoAmI])
    return user
}

export function useCurrentVisitingUser(refresh?: boolean) {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const identity = useCurrentVisitingIdentity()
    useAsync(async () => {
        let address = ''
        try {
            const response = await PluginPetRPC.getUserAddress(identity.identifier.userId ?? '')
            if (response) address = response as string
        } finally {
            setUser({
                userId: identity.identifier.userId ?? '',
                address: address ?? '',
            })
        }
    }, [identity, refresh])
    return user
}
