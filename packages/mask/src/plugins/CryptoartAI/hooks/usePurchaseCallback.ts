import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { toFixed } from '@masknet/web3-shared-base'
import { TransactionEventType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePurchaseCallback(editionNumber: string, priceInWei: number) {
    const account = useAccount()
    const chainId = useChainId()
    const { knownOriginDigitalAssetV2_contract } = useCryptoArtAI_Contract()
    const [loading, setLoading] = useState(false)

    const purchaseCallback = useCallback(async () => {
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
                    setLoading(false)
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
        }).finally(() => setLoading(false))
    }, [account, chainId, knownOriginDigitalAssetV2_contract])

    return [loading, purchaseCallback] as const
}
