import type { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { useState } from 'react'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { useAccount } from './useAccount'
import { useBlockNumber, useChainId } from './useChainState'

export function useTransaction(hash: string) {
    const account = useAccount()
    const [tx, setTx] = useState<TransactionResponse | null>(null)
    useAsync(async () => {
        if (tx) return
        if (!hash) return
        setTx(await Services.Ethereum.getTransaction(hash, await Services.Ethereum.getChainId(account)))
    }, [account, hash, tx])
    return tx
}

export function useTransactionReceipt(hash: string) {
    const [receipt, setReceipt] = useState<TransactionReceipt | null>(null)
    const account = useAccount()
    const chainId = useChainId()
    const blockNumber = useBlockNumber(chainId)
    useAsync(async () => {
        if (!hash) {
            setReceipt(null)
            return
        }
        if (receipt?.transactionHash === hash) return
        setReceipt(await Services.Ethereum.getTransactionReceipt(hash, await Services.Ethereum.getChainId(account)))
    }, [account, hash, receipt, blockNumber])
    return receipt
}
