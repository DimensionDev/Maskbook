import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { EtherTokenDetailed, ERC20TokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'
import { gcd, sortTokens } from '../helpers'
import { ITO_CONTRACT_BASE_DATE } from '../constants'

export interface PoolSettings {
    password: string
    startTime: Date
    endTime: Date
    title: string
    name: string
    limit: string
    total: string
    exchangeAmounts: string[]
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    token?: EtherTokenDetailed | ERC20TokenDetailed
}

export function useFillCallback(poolSettings: PoolSettings) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const [fillState, setFillState] = useTransactionState()
    const [fillSettings, setFillSettings] = useState<PoolSettings | null>(null)

    const fillCallback = useCallback(async () => {
        const {
            password,
            startTime,
            endTime,
            name,
            title,
            token,
            total,
            limit,
            exchangeAmounts: exchangeAmountsUnsorted,
            exchangeTokens: exchangeTokensUnsorted,
        } = poolSettings

        if (!token || !ITO_Contract) {
            setFillState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // sort amounts and tokens
        const sorted = exchangeAmountsUnsorted
            .map((x, i) => ({
                amount: x,
                token: exchangeTokensUnsorted[i],
            }))
            .sort((unsortedA, unsortedB) => sortTokens(unsortedA.token, unsortedB.token))

        const exchangeAmounts = sorted.map((x) => x.amount)
        const exchangeTokens = sorted.map((x) => x.token)

        const startTime_ = Math.floor((startTime.getTime() - ITO_CONTRACT_BASE_DATE.getTime()) / 1000)
        const endTime_ = Math.floor((endTime.getTime() - ITO_CONTRACT_BASE_DATE.getTime()) / 1000)
        const now_ = Math.floor((Date.now() - ITO_CONTRACT_BASE_DATE.getTime()) / 1000)

        // error: the start time before 1606780800
        if (startTime_ < 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid start time.'),
            })
            return
        }

        // error: the end time before 1606780800
        if (endTime_ < 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid end time.'),
            })
            return
        }

        // error: the start time after the end time
        if (startTime_ >= endTime_) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('The start date should before the end date.'),
            })
            return
        }

        // error: the end time before now
        if (endTime_ <= now_) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('The end date should be a future date.'),
            })
            return
        }

        // error: limit greater than the total supply
        if (new BigNumber(limit).isGreaterThan(total)) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Limits should less than the total supply.'),
            })
            return
        }

        // error: exceed the max available total supply
        if (new BigNumber(total).isGreaterThan(new BigNumber('2e128'))) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Exceed the max available total supply'),
            })
            return
        }

        // error: The size of amounts and the size of tokens not match
        if (exchangeAmounts.length !== exchangeTokens.length) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Cannot match amounts with tokens.'),
            })
            return
        }

        const ONE_TOKEN = new BigNumber(1).multipliedBy(new BigNumber(10).pow(token.decimals ?? 0))
        const exchangeAmountsDivided = exchangeAmounts.map((x, i) => {
            const amount = new BigNumber(x)
            const divisor = gcd(ONE_TOKEN, amount)
            return [amount.dividedToIntegerBy(divisor), ONE_TOKEN.dividedToIntegerBy(divisor)] as const
        })

        // error: token amount is not enough for dividing into integral pieces
        const totalAmount = new BigNumber(total)
        const invalidTokenAt = exchangeAmountsDivided.findIndex(([tokenAmountA, tokenAmountB]) =>
            totalAmount.multipliedBy(tokenAmountA).dividedToIntegerBy(tokenAmountB).isZero(),
        )
        if (invalidTokenAt >= 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error(
                    `Cannot swap enough ${token.symbol ?? ''} out with ${exchangeTokens[invalidTokenAt].symbol ?? ''}`,
                ),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setFillState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? total : '0').toFixed(),
        }
        const params: Parameters<typeof ITO_Contract['methods']['fill_pool']> = [
            Web3Utils.sha3(password)!,
            startTime_,
            endTime_,
            name,
            title,
            exchangeTokens.map((x) => x.address),
            exchangeAmountsDivided.flatMap((x) => x).map((y) => y.toFixed()),
            token.address,
            total,
            limit,
        ]

        // step 1: estimate gas
        const estimatedGas = await ITO_Contract.methods
            .fill_pool(...params)
            .estimateGas(config)
            .catch((error: Error) => {
                setFillState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = ITO_Contract.methods.fill_pool(...params).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setFillSettings(poolSettings)
                setFillState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
            })
            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setFillSettings(poolSettings)
                setFillState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })
            promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                setFillState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            })
        })
    }, [account, ITO_Contract, poolSettings])

    const resetCallback = useCallback(() => {
        setFillState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [fillSettings, fillState, fillCallback, resetCallback] as const
}
