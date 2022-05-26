import { useAsyncFn } from 'react-use'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import { useMaskITO_Contract } from './useMaskITO_Contract'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export function useMaskClaimCallback() {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const MaskITO_Contract = useMaskITO_Contract(chainId)

    return useAsyncFn(async () => {
        if (!MaskITO_Contract) return

        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await MaskITO_Contract.methods.claim().estimateGas({
                from: account,
            }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            MaskITO_Contract.methods
                .claim()
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, MaskITO_Contract])
}
