import { useEffect, useState } from 'react'
import { useAccount, useAddressNames } from '@masknet/web3-shared-evm'
import type { User } from '../types'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'
import { useCurrentVisitingIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'

export function useUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const account = useAccount()
    const whoAmI = useLastRecognizedIdentity()
    useEffect(() => {
        if (account && whoAmI?.identifier?.userId) {
            setUser({ userId: whoAmI?.identifier?.userId, address: account })
        }
    }, [account, whoAmI])
    return user
}

export function useCurrentVisitingUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const [avaAddress, setAvaAddress] = useState('')
    const identity = useCurrentVisitingIdentity()
    const { value: addressNames = [] } = useAddressNames(identity)

    useEffect(() => {
        const userId = identity.identifier.userId
        if (userId) {
            PluginNFTAvatarRPC.getAddress(userId).then((address) => setAvaAddress(address))
        }
    }, [identity])

    useEffect(() => {
        setUser({
            userId: identity.identifier.userId ?? '',
            address: addressNames.length ? addressNames[0].resolvedAddress : avaAddress,
        })
    }, [addressNames, avaAddress])
    return user
}
