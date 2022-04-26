import { useState } from 'react'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleTokenBalance } from './useFungibleTokenBalance'
import { useFungibleToken } from './useFungibleToken'

export function useFungibleTokenWatched<T extends NetworkPluginID>(pluginID?: T, address_: string = '') {
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState(address_)
    const token = useFungibleToken(pluginID, address)
    const balance = useFungibleTokenBalance(pluginID, address)

    return {
        amount,
        setAmount,
        address: token.value?.address ?? address,
        setAddress,
        token,
        balance,
    }
}
