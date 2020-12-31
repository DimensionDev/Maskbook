import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useTransactionReceipt } from './useTransaction'
import { useEtherTokenBalance } from './useEtherTokenBalance'
import { ServicesWithProgress } from '../../extension/service'
import { toHex } from 'web3-utils'
import { StageType } from '../../utils/promiEvent'

export enum TransferStateType {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_TRANSFERRED,
    PENDING,
    TRANSFERRED,
}

export interface TransferState {
    type: TransferStateType
}

export function useEtherTransferCallback(amount?: string, recipient?: string, memo?: string) {
    const account = useAccount()
    const { value: balance, retry: revalidateBalance } = useEtherTokenBalance(account)

    const [transferHash, setTransferHash] = useState('')
    const receipt = useTransactionReceipt(transferHash)

    const transferStateType: TransferStateType = useMemo(() => {
        if (receipt?.blockHash) return TransferStateType.TRANSFERRED
        if (!amount || !recipient || !balance) return TransferStateType.UNKNOWN
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return TransferStateType.INSUFFICIENT_BALANCE
        if (transferHash && !receipt?.blockHash) return TransferStateType.PENDING
        return TransferStateType.NOT_TRANSFERRED
    }, [account, amount, recipient])

    const transferCallback = useCallback(async () => {
        if (transferStateType !== TransferStateType.NOT_TRANSFERRED) return
        if (!account || !recipient) return
        if (!amount || new BigNumber(amount).isZero()) return

        return new Promise<string>(async (resolve, reject) => {
            const iterator = ServicesWithProgress.sendTransaction(account, {
                from: account,
                value: amount,
                data: memo ? toHex(memo) : undefined,
            })
            try {
                for await (const stage of iterator) {
                    if (stage.type === StageType.TRANSACTION_HASH) {
                        setTransferHash(stage.hash)
                        resolve(stage.hash)
                        break
                    }
                }
            } catch (error) {
                reject(error)
            }
        })
    }, [transferStateType, account, amount, recipient, memo])

    const resetCallback = useCallback(() => {
        setTransferHash('')
        revalidateBalance()
    }, [])

    // reset transfer state
    useEffect(() => {
        setTransferHash('')
    }, [amount, recipient, memo])

    // revalidate balance if tx hash was cleaned
    useEffect(() => {
        if (!transferHash) revalidateBalance()
    }, [transferHash])

    return [
        {
            type: transferStateType,
        },
        transferCallback,
        resetCallback,
    ] as const
}
