import { useEffect, useState } from 'react'
import { useChainId } from '@masknet/web3-shared'
import { useAsyncRetry } from 'react-use'
import { PluginMessages, PluginServices } from '../../../API'

export function useAddressBook() {
    const chainId = useChainId()
    const [flag, setFlag] = useState(false)

    useEffect(() => PluginMessages.Wallet.events.addressBookUpdated.on(() => setFlag((x) => !x)), [])

    return useAsyncRetry(async () => PluginServices.Wallet.getAllAddress(), [flag, chainId])
}
