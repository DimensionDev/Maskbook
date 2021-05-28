import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Transaction, TransactionReceipt } from 'web3-core'
import Services from '../../extension/service'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'

export function useTransaction(hash: string) {
    const account = useAccount()
    const [tx, setTx] = useState<Transaction | null>(null)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransactionByHash(hash))
    }, [account, hash, tx])
    return tx
}

export function useTransactionReceipt(hash: string) {
    const [receipt, setReceipt] = useState<TransactionReceipt | null>(null)
    const account = useAccount()
    const chainId = useChainId()
    useAsync(async () => {
        if (!hash) {
            setReceipt(null)
            return
        }
        if (receipt?.transactionHash === hash) return
        setReceipt(await Services.Ethereum.getTransactionReceipt(hash))
    }, [account, hash, receipt, chainId])
    return receipt
}
