import { useEffect } from 'react'
import { useChainId } from '@masknet/web3-shared-evm'
import { useAsyncRetry } from 'react-use'
import { PluginMessages, PluginServices } from '../../../API'

export function useAddressBook() {
    const chainId = useChainId()
    const result = useAsyncRetry(() => PluginServices.Wallet.getAllAddress(chainId), [chainId])

    useEffect(() => PluginMessages.Wallet.events.addressBookUpdated.on(result.retry), [result.retry])

    return result
}
