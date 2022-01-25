import { useState } from 'react'
import { useAsync } from 'react-use'
import type { Transaction, TransactionReceipt } from 'web3-core'
import { useAccount } from './useAccount'
import { useBlockNumber } from './useBlockNumber'
import { useWeb3 } from './useWeb3'

export function useTransaction(hash: string) {
    const web3 = useWeb3()
    const account = useAccount()
    const [tx, setTx] = useState<Transaction | null>(null)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await web3.eth.getTransaction(hash))
    }, [web3, account, hash, tx])
    return tx
}

export function useTransactionReceipt(hash: string) {
    const web3 = useWeb3()
    const [receipt, setReceipt] = useState<TransactionReceipt | null>(null)
    const account = useAccount()
    const blockNumber = useBlockNumber()
    useAsync(async () => {
        if (!hash) {
            setReceipt(null)
            return
        }
        if (receipt?.transactionHash === hash) return
        setReceipt(await web3.eth.getTransactionReceipt(hash))
    }, [web3, account, hash, receipt, blockNumber])
    return receipt
}
