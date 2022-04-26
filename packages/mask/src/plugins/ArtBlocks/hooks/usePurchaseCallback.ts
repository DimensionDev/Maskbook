import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeTransaction, SchemaType } from '@masknet/web3-shared-evm'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(projectId: string, amount: string, schemaType?: SchemaType) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const artBlocksContract = useArtBlocksContract(chainId)

    return useCallback(async () => {
        if (!artBlocksContract) {
            throw new Error('Failed to create contract instance.')
        }
        const transaction = await encodeTransaction(artBlocksContract, artBlocksContract.methods.purchase(projectId), {
            from: account,
            value: new BigNumber(schemaType === SchemaType.Native ? amount : 0).toFixed(),
        })

        return connection?.sendTransaction(transaction)
    }, [account, amount, chainId, artBlocksContract, schemaType, connection])
}
