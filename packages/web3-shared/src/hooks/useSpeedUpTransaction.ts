import { TransactionState, TransactionStateType, useChainId, useChainConstants, useWeb3, isSameAddress } from '..'
import type { Transaction } from 'web3-core'
import { useAsync } from 'react-use'
import { useState, useEffect } from 'react'
import { Interface, Fragment, JsonFragment } from '@ethersproject/abi'
import type { Options } from 'web3-eth-contract'
import urlcat from 'urlcat'

export function useSpeedUpTransaction(
    state: TransactionState,
    from: string,
    contractData: Options | undefined,
    contractFunctionName: string,
    checkSpeedUpTx: (decodedInputParam: any) => boolean,
    originalTxBlockNumber: number,
) {
    const web3 = useWeb3()
    const chainId = useChainId()
    const [speedUpTx, setSpeedUpTx] = useState<Transaction | null>(null)
    const { EXPLORER_API, EXPLORER_API_KEY, TIME_INTERVAL_TO_QUERY_API } = useChainConstants()
    const [openTimer, setOpenTimer] = useState<NodeJS.Timeout | null>(null)
    const interFace = contractData
        ? new Interface(contractData.jsonInterface as readonly (string | Fragment | JsonFragment)[])
        : null

    useEffect(() => {
        if (openTimer && speedUpTx) {
            clearInterval(openTimer)
            setOpenTimer(null)
        }
    }, [speedUpTx, openTimer])

    useAsync(async () => {
        if (
            state.type !== TransactionStateType.HASH ||
            !contractData ||
            !interFace ||
            !EXPLORER_API ||
            !TIME_INTERVAL_TO_QUERY_API
        ) {
            if (openTimer) {
                clearInterval(openTimer)
                setOpenTimer(null)
            }
            return
        }

        if (!openTimer)
            setOpenTimer(
                setInterval(async () => {
                    const latestBlockNumber = await web3.eth.getBlockNumber()
                    const response = await fetch(
                        urlcat(EXPLORER_API, {
                            apikey: EXPLORER_API_KEY,
                            action: 'txlist',
                            module: 'account',
                            sort: 'desc',
                            startBlock: originalTxBlockNumber,
                            endBlock: latestBlockNumber,
                            address: contractData.address,
                        }),
                    )

                    if (!response.ok) return

                    const { result }: { result: Transaction[] } = await response.json()

                    if (!result.length) return

                    const _speedUpTx =
                        result.find((tx: Transaction) => {
                            if (!isSameAddress(tx.to ?? '', contractData.address) || !isSameAddress(tx.from, from)) {
                                return false
                            }
                            try {
                                const decodedInputParam = interFace.decodeFunctionData(contractFunctionName, tx.input)
                                return checkSpeedUpTx(decodedInputParam)
                            } catch {
                                return false
                            }
                        }) ?? null
                    setSpeedUpTx(_speedUpTx)
                }, TIME_INTERVAL_TO_QUERY_API),
            )

        return
    }, [state, openTimer, from, contractData, interFace, chainId, originalTxBlockNumber, web3])

    return speedUpTx
}
