import { useEffect, useState } from 'react'
import { useAccount, useEthereumAddress } from '@masknet/web3-shared-evm'
import type { User } from '../types'
import { TWITTER } from '../constants'
import { PluginNFTAvatarRPC } from '../../Avatar/messages'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { useCurrentVisitingIdentity } from '../../../components/DataSource/useActivatedUI'

export function useUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const account = useAccount()
    const myPersonas = useMyPersonas()
    useEffect(() => {
        const identifiers: Array<string> = []
        myPersonas.forEach((persona) => {
            ;[...persona.linkedProfiles].forEach(([key]) => {
                if (key.network === TWITTER) {
                    identifiers.push(key.userId)
                }
            })
        })
        if (identifiers.length === 0) return
        const userId = identifiers[0]
        setUser({ userId, address: account })
        // sometimes rpc no call back
        PluginNFTAvatarRPC.getAddress(userId).then((address) => {
            setUser({ userId, address: address ?? account })
        })
    }, [myPersonas])
    return user
}

export function useCurrentVisitingUser() {
    const [user, setUser] = useState<User>({ userId: '', address: '' })
    const [avaAddress, setAvaAddress] = useState('')
    const identity = useCurrentVisitingIdentity()
    const { value: valueEVM } = useEthereumAddress(
        identity.nickname ?? '',
        identity.identifier.userId,
        identity.bio ?? '',
    )
    const { address } = valueEVM ?? {}

    useEffect(() => {
        const userId = identity.identifier.userId
        if (userId) {
            PluginNFTAvatarRPC.getAddress(userId).then((address) => setAvaAddress(address))
        }
    }, [identity])

    useEffect(() => {
        setUser({ userId: identity.identifier.userId ?? '', address: address || avaAddress })
    }, [address, avaAddress])
    return user
}
