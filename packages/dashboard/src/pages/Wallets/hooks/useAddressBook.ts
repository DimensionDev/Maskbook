import { useEffect } from 'react'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { PluginMessages, PluginServices } from '../../../API'

export function useAddressBook() {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const result = useAsyncRetry(async () => PluginServices.Wallet.getAllAddress(chainId), [chainId])

    useEffect(() => PluginMessages.Wallet.events.addressBookUpdated.on(result.retry), [result.retry])

    return result
}
