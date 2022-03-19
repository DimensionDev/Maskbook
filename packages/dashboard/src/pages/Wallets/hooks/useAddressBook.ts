import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import { NetworkPluginID, useChainId } from '@masknet/plugin-infra'
import { PluginMessages, PluginServices } from '../../../API'

export function useAddressBook() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const result = useAsyncRetry(async () => PluginServices.Wallet.getAllAddress(chainId), [chainId])

    useEffect(() => PluginMessages.Wallet.events.addressBookUpdated.on(result.retry), [result.retry])

    return result
}
