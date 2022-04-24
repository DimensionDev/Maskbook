import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount, useChainId, useWeb3Connection } from '@masknet/plugin-infra/src/web3'
import { NetworkPluginID } from '@masknet/plugin-infra/web3'
import { ChainId, encodeTransaction, SchemaType, ProviderType, Transaction } from '@masknet/web3-shared-evm'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(projectId: string, amount: string, tokenType?: number) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId<ChainId>(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection<ChainId, ProviderType, Transaction>(NetworkPluginID.PLUGIN_EVM)
    const artBlocksContract = useArtBlocksContract()

    return useCallback(async () => {
        if (!artBlocksContract) {
            throw new Error('Failed to create contract instance.')
        }
        const transaction = await encodeTransaction(artBlocksContract, artBlocksContract.methods.purchase(projectId), {
            from: account,
            value: new BigNumber(tokenType === SchemaType.Native ? amount : 0).toFixed(),
        })

        return connection?.sendTransaction(transaction)
    }, [account, amount, chainId, artBlocksContract, tokenType, connection])
}
