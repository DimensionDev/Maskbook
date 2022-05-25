import type { PayableTransactionObject, PayableTx } from '@masknet/web3-contracts/types/types'
import { omit } from 'lodash-unified'
import { useCallback, useState } from 'react'
import { TransactionEventType } from '../types'

export function useTransactionCallback<T extends unknown>(
    config: PayableTx | undefined,
    method: PayableTransactionObject<T> | undefined,
) {
    const [loading, setLoading] = useState(false)

    const updateCallback = useCallback(async () => {
        if (!config || !method) return

        const gasExpectedConfig = { ...config }

        setLoading(true)
        try {
            const estimatedGas = await method.estimateGas(omit(config, 'gas'))
            if (!gasExpectedConfig.gas && estimatedGas) {
                gasExpectedConfig.gas = estimatedGas
            }
        } catch (error) {
            try {
                await method.call(config)
            } catch (error) {
                setLoading(false)
                throw error
            }
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

    return [loading, updateCallback] as const
}
