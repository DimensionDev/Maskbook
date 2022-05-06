import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { toFixed } from '@masknet/web3-shared-base'
import { TransactionEventType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePurchaseCallback(editionNumber: string, priceInWei: number) {
    const account = useAccount()
    const chainId = useChainId()
    const { knownOriginDigitalAssetV2_contract } = useCryptoArtAI_Contract()

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
