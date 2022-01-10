import { useEffect, useState } from 'react'
import { useAccount, useAddressNames } from '@masknet/web3-shared-evm'
import type { User } from '../types'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'

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

export function useCurrentVisitingUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const identity = useCurrentVisitingIdentity()
    const { value: addressNames = [] } = useAddressNames(identity)
    useEffect(() => {
        setUser({
            userId: identity.identifier.userId ?? '',
            address: addressNames.length ? addressNames[0].resolvedAddress : '',
        })
    }, [identity, addressNames])
    return user
}
