import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Transaction, TransactionReceipt } from 'web3-core'
import Services from '../../extension/service'
import { useBlockNumber } from './useBlockNumber'
import { Token, EthereumTokenType } from '../types'

export function useTransaction(hash: string) {
    const [tx, setTx] = useState<Transaction | null>(null)
    useAsync(async () => {
        if (tx) return
        setTx(await Services.Ethereum.getTransaction(hash))
    }, [hash, tx])
    return tx
}

export function useTransactionReceipt(id: string) {
    const [tx, setTx] = useState<TransactionReceipt | null>(null)
    const blockNumber = useBlockNumber()
    useAsync(async () => {
        if (tx) return
        setTx(await Services.Ethereum.getTransactionReceipt(id))
    }, [id, tx, blockNumber])
    return tx
}
