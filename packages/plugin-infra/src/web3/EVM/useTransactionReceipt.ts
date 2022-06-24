import { useAsyncRetry } from 'react-use'
import type { BaseContract } from '@masknet/web3-contracts/types/types'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { decodeEvents } from '@masknet/web3-shared-evm'
import { useWeb3 } from '../useWeb3'
import { useWeb3Connection } from '../useWeb3Connection'

export function useTransactionReceipt<T extends Record<string, unknown>>(hash: string, contract?: BaseContract | null) {
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)

    return useAsyncRetry(async () => {
        const receipt = await connection.getTransactionReceipt(hash)
        if (!receipt) return

        // if the contract is not given, return the raw receipt from RPC
        if (!contract) return receipt

        return {
            ...receipt,
            events: decodeEvents(web3, contract.options.jsonInterface, receipt) as T,
        }
    }, [hash, contract, connection, web3])
}
