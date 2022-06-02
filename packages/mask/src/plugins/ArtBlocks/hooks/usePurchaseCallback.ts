import { useAccount } from '@masknet/plugin-infra/web3'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, SchemaType, TransactionEventType } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(chainId: ChainId, projectId: string, amount: string, schema = SchemaType.Native) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const genArt721MinterContract = useArtBlocksContract(chainId)

    return useAsyncFn(async () => {
        if (!genArt721MinterContract) return

        const value = new BigNumber(schema === SchemaType.Native ? amount : 0).toFixed()
        const config = {
            from: account,
            value,
            gas: await genArt721MinterContract.methods
                .purchase(projectId)
                .estimateGas({
                    from: account,
                    value,
                })
                .catch((error) => {
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            genArt721MinterContract.methods
                .purchase(projectId)
                .send(config as PayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, amount, chainId, genArt721MinterContract])
}
