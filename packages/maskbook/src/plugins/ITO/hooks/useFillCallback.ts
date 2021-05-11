import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { EtherTokenDetailed, ERC20TokenDetailed, TransactionEventType } from '../../../web3/types'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { addGasMargin } from '../../../web3/helpers'
import { gcd, sortTokens } from '../helpers'
import { ITO_CONTRACT_BASE_TIMESTAMP, MSG_DELIMITER } from '../constants'
import Services from '../../../extension/service'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import type { AdvanceSettingData } from '../UI/AdvanceSetting'
import type { ITO } from '@dimensiondev/contracts/types/ITO'

export interface PoolSettings {
    password: string
    startTime: Date
    endTime: Date
    unlockTime?: Date
    regions: string
    title: string
    name: string
    limit: string
    total: string
    qualificationAddress: string
    exchangeAmounts: string[]
    exchangeTokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
    token?: ERC20TokenDetailed
    advanceSettingData: AdvanceSettingData
}

export function useFillCallback(poolSettings?: PoolSettings) {
    const account = useAccount()
    const chainId = useChainId()
    const ITO_Contract = useITO_Contract()

    const [fillState, setFillState] = useTransactionState()
    const [fillSettings, setFillSettings] = useState(poolSettings)

    const fillCallback = useCallback(async () => {
        if (!poolSettings) {
            setFillState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const {
            password,
            startTime,
            endTime,
            title,
            name,
            token,
            total,
            limit,
            qualificationAddress,
            unlockTime,
            regions,
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

        const BASE_TIMESTAMP = ITO_CONTRACT_BASE_TIMESTAMP
        const startTime_ = Math.floor((startTime.getTime() - BASE_TIMESTAMP) / 1000)
        const endTime_ = Math.floor((endTime.getTime() - BASE_TIMESTAMP) / 1000)
        const unlockTime_ = unlockTime ? Math.floor((unlockTime.getTime() - BASE_TIMESTAMP) / 1000) : 0
        const now_ = Math.floor((Date.now() - BASE_TIMESTAMP) / 1000)

        // error: the start time before BASE TIMESTAMP
        if (startTime_ < 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid start time.'),
            })
            return
        }

        // error: the end time before BASE TIMESTAMP
        if (endTime_ < 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid end time.'),
            })
            return
        }

        // error: the unlock time before BASE TIMESTAMP
        if (unlockTime_ < 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid unlock time.'),
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

        // error: unlock time before end time
        if (endTime_ >= unlockTime_ && unlockTime_ !== 0) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('The unlock date should be later than end date.'),
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
        if (new BigNumber(total).isGreaterThan('2e128')) {
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

        // error: token amount is not enough for dividing into integral pieces
        const ONE_TOKEN = new BigNumber(1).multipliedBy(new BigNumber(10).pow(token.decimals ?? 0))
        const exchangeAmountsDivided = exchangeAmounts.map((x, i) => {
            const amount = new BigNumber(x)
            const divisor = gcd(ONE_TOKEN, amount)
            return [amount.dividedToIntegerBy(divisor), ONE_TOKEN.dividedToIntegerBy(divisor)] as const
        })
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

        // error: unable to sign password
        let signedPassword = ''
        try {
            signedPassword = await Services.Ethereum.sign(password, account)
        } catch (e) {
            signedPassword = ''
        }
        if (!signedPassword) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to sign password.'),
            })
            return
        }

        // the given settings is valid
        setFillSettings({
            ...poolSettings,
            startTime: new Date(Math.floor(startTime.getTime() / 1000) * 1000),
            endTime: new Date(Math.floor(endTime.getTime() / 1000) * 1000),
            unlockTime: unlockTime ? new Date(Math.floor(unlockTime.getTime() / 1000) * 1000) : undefined,
            password: signedPassword,
            exchangeAmounts: exchangeAmountsDivided.flatMap((x) => x).map((y) => y.toFixed()),
        })

        // pre-step: start waiting for provider to confirm tx
        setFillState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
            value: '0',
        }

        let params = [
            Web3Utils.sha3(signedPassword)!,
            startTime_,
            endTime_,
            // TODO: store message as bitmap, since regions may be very large.
            [name, title, regions].join(MSG_DELIMITER),
            exchangeTokens.map((x) => x.address),
            exchangeAmountsDivided.flatMap((x) => x).map((y) => y.toFixed()),
            unlockTime_,
            token.address,
            total,
            limit,
            qualificationAddress,
        ] as Parameters<ITO['methods']['fill_pool']>

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
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setFillState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
            })
            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
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
    }, [account, chainId, ITO_Contract, poolSettings])

    const resetCallback = useCallback(() => {
        setFillState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [fillSettings, fillState, fillCallback, resetCallback] as const
}
