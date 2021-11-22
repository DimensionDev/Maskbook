import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    TransactionEventType,
    TransactionStateType,
    useTransactionState,
    useAccount,
    useChainId,
} from '@masknet/web3-shared-evm'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePurchaseCallback(editionNumber: number, priceInWei: number) {
    const account = useAccount()
    const chainId = useChainId()
    const { knownOriginDigitalAssetV2_contract } = useCryptoArtAI_Contract()
    const [purchaseState, setPurchaseState] = useTransactionState()

    const purchaseCallback = useCallback(async () => {
        if (!knownOriginDigitalAssetV2_contract) {
            setPurchaseState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setPurchaseState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const config = {
            from: account,
            value: new BigNumber(priceInWei).toFixed(),
            gas: await knownOriginDigitalAssetV2_contract.methods
                .purchase(editionNumber)
                .estimateGas({
                    from: account,
                    value: new BigNumber(priceInWei).toFixed(),
                })
                .catch((error) => {
                    setPurchaseState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            knownOriginDigitalAssetV2_contract.methods
                .purchase(editionNumber)
                .send(config as NonPayableTx)
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setPurchaseState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setPurchaseState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setPurchaseState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, chainId, knownOriginDigitalAssetV2_contract])

    const resetCallback = useCallback(() => {
        setPurchaseState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [purchaseState, purchaseCallback, resetCallback] as const
}
