import { useAsyncFn } from 'react-use'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '@masknet/web3-shared-evm'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'
import { NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'

export function usePurchaseCallback(editionNumber: string, priceInWei: number) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { knownOriginDigitalAssetV2_contract } = useCryptoArtAI_Contract(chainId)

    return useAsyncFn(async () => {
        if (!knownOriginDigitalAssetV2_contract) return

        // estimate gas and compose transaction
        const config = {
            from: account,
            value: toFixed(priceInWei),
            gas: await knownOriginDigitalAssetV2_contract.methods
                .purchase(editionNumber)
                .estimateGas({
                    from: account,
                    value: toFixed(priceInWei),
                })
                .catch((error) => {
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            knownOriginDigitalAssetV2_contract.methods
                .purchase(editionNumber)
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, knownOriginDigitalAssetV2_contract])
}
