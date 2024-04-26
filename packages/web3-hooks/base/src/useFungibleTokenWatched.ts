import { useState } from 'react'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenBalance } from './useFungibleTokenBalance.js'
import { useFungibleToken } from './useFungibleToken.js'

export function useFungibleTokenWatched<T extends NetworkPluginID>(pluginID?: T, address_ = '') {
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState(address_)
    const token = useFungibleToken(pluginID, address)
    const balance = useFungibleTokenBalance(pluginID, address)

    return {
        amount,
        setAmount,
        address: token.data?.address ?? address,
        setAddress,
        token,
        balance,
    }
}
