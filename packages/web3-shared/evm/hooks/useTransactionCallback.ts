import type { PayableTransactionObject, PayableTx } from '@masknet/web3-contracts/types/types'
import { omit } from 'lodash-unified'
import { useAsyncFn } from 'react-use'
import { TransactionEventType } from '../types'

export function useTransactionCallback<T extends unknown>(
    config: PayableTx | undefined,
    method: PayableTransactionObject<T> | undefined,
) {
    return useAsyncFn(async () => {
        if (!config || !method) return

        const gasExpectedConfig = { ...config }

        try {
            const estimatedGas = await method.estimateGas(omit(config, 'gas'))
            if (!gasExpectedConfig.gas && estimatedGas) {
                gasExpectedConfig.gas = estimatedGas
            }
        } catch (error) {
            await method.call(config)
        }

        return new Promise<string>(async (resolve, reject) => {
            method
                .send(gasExpectedConfig)
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .once(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [config, method])
}
