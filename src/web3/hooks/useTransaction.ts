import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Transaction, TransactionReceipt } from 'web3-core'
import Services from '../../extension/service'
import { useBlockNumber } from './useChainState'

export function useTransaction(hash: string) {
    const [tx, setTx] = useState<Transaction | null>(null)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransaction(hash))
    }, [hash, tx])
    return tx
}

export function useTransactionReceipt(hash: string) {
    const [tx, setTx] = useState<TransactionReceipt | null>(null)
    const blockNumber = useBlockNumber()
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransactionReceipt(hash))
    }, [hash, tx, blockNumber])
    return tx
}
