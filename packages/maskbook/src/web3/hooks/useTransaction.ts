import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Transaction, TransactionReceipt } from 'web3-core'
import Services from '../../extension/service'
import { useBlockNumber, useChainId } from './useChainState'

export function useTransaction(from: string, hash: string) {
    const [tx, setTx] = useState<Transaction | null>(null)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransaction(hash, await Services.Ethereum.getChainId(from)))
    }, [hash, tx])
    return tx
}

export function useTransactionReceipt(from: string, hash: string) {
    const [tx, setTx] = useState<TransactionReceipt | null>(null)
    const chainId = useChainId(from)
    const blockNumber = useBlockNumber(chainId)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransactionReceipt(hash, await Services.Ethereum.getChainId(from)))
    }, [hash, tx, blockNumber])
    return tx
}
