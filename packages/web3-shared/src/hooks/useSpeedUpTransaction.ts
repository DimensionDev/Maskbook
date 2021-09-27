import { TransactionState, TransactionStateType, isSameAddress } from '..'
import type { Transaction } from 'web3-core'
import { useWeb3 } from './useWeb3'
import { useAsync } from 'react-use'
import { useState } from 'react'
import { Interface, Fragment, JsonFragment } from '@ethersproject/abi'
import type { Options } from 'web3-eth-contract'

export function useSpeedUpTransaction(
    state: TransactionState,
    from: string,
    contractData: Options | undefined,
    transactionFunctionName: string,
    timeout: number,
) {
    const web3 = useWeb3()
    const [speedUpTx, setSpeedUpTx] = useState<Transaction | null>(null)
    const [openTimer, setOpenTimer] = useState<NodeJS.Timeout | null>(null)
    const interFace = contractData
        ? new Interface(contractData.jsonInterface as readonly (string | Fragment | JsonFragment)[])
        : null

    useAsync(async () => {
        if (state.type !== TransactionStateType.HASH || !contractData || !interFace) {
            if (openTimer) clearTimeout(openTimer)
            return null
        }

        setOpenTimer(
            setTimeout(async () => {
                const pendingTransactions: Transaction[] = await web3.eth.getPendingTransactions()
                const originalTx = pendingTransactions.find((v) => state.hash === v.hash)

                if (originalTx) {
                    setSpeedUpTx(null)
                    return
                }

                const _speedUpTx =
                    pendingTransactions.find((v) => {
                        if (!isSameAddress(v.to ?? '', contractData.address) || !isSameAddress(v.from, from))
                            return false
                        try {
                            interFace.decodeFunctionData(transactionFunctionName, v.input)

                            return true
                        } catch {
                            return false
                        }
                    }) ?? null

                setSpeedUpTx(_speedUpTx)
            }, timeout),
        )
        const pendingTransactions: Transaction[] = await web3.eth.getPendingTransactions()
        return pendingTransactions
    }, [web3, state, timeout, openTimer, from, contractData, interFace])

    return speedUpTx
}
