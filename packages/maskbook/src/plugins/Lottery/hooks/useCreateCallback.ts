import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import { useLotteryContract } from '../contracts/useLotteryContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { Token, EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import type { TransactionReceipt } from 'web3-core'
import { getTotalWinner, getTotalToken } from '../utils'

export interface LotterySettings {
    password: string
    duration: number
    if_draw_at_time: boolean
    draw_at_time: number
    draw_at_number: number
    prize_class: (string | number)[][]
    token: Token
    name: string
    message: string
    total: string
}

export function useCreateCallback(lotterySettings: LotterySettings) {
    const account = useAccount()
    const [createState, setCreateState] = useTransactionState()
    const lotteryContract = useLotteryContract()
    const [createSettings, setCreateSettings] = useState<LotterySettings | null>(null)

    const createCallback = useCallback(async () => {
        if (!lotteryContract) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }
        const {
            password,
            duration,
            if_draw_at_time,
            draw_at_time,
            draw_at_number,
            prize_class,
            message,
            name,
            total,
            token,
        } = lotterySettings

        const total_winner = getTotalWinner(prize_class)
        const total_token = new BigNumber(getTotalToken(prize_class))

        // error handling
        if (new BigNumber(total).isLessThan(total_token)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('not enough token.'),
            })
            return
        }
        if (total_winner <= 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('At least 1 person should be able to win the lottery.'),
            })
            return
        }
        if (token.type !== EthereumTokenType.Ether && token.type !== EthereumTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('Token not supported'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const seed = Math.random().toString()
        const config: Tx = {
            from: account,
            to: lotteryContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? total : '0').toFixed(),
        }
        const params: Parameters<typeof lotteryContract['methods']['create_lottery']> = [
            Web3Utils.sha3(password)!,
            duration,
            if_draw_at_time,
            draw_at_time,
            draw_at_number,
            Web3Utils.sha3(seed)!,
            message,
            name,
            token.type === EthereumTokenType.Ether ? 0 : 1,
            token.type === EthereumTokenType.Ether ? account : token.address, // this field must be a valid address
            prize_class,
        ]

        console.log('#===== params =====#')
        console.log(params)

        // step 1: estimate gas
        const estimatedGas = await lotteryContract.methods
            .create_lottery(...params)
            .estimateGas(config)
            .catch((error: any) => {
                setCreateState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>(async (resolve, reject) => {
            const promiEvent = lotteryContract.methods.create_lottery(...params).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })
            promiEvent.on('receipt', (receipt: TransactionReceipt) => {
                setCreateState({
                    type: TransactionStateType.RECEIPT,
                    receipt,
                })
            })
            promiEvent.on('confirmation', (no: number, receipt: TransactionReceipt) => {
                setCreateSettings(lotterySettings)
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })
            promiEvent.on('error', reject)
        })
    }, [account, lotteryContract, lotterySettings])

    return [createSettings, createState, createCallback] as const
}
