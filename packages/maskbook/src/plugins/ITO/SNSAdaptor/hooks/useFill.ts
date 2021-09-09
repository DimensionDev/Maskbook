import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { omit } from 'lodash-es'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    isGreaterThan,
    ONE,
    pow10,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTransactionState,
    useWeb3,
    FungibleTokenDetailed,
    ERC20TokenDetailed,
    TransactionState,
    FAKE_SIGN_PASSWORD,
} from '@masknet/web3-shared'
import { useITO_Contract } from './useITO_Contract'
import { gcd, sortTokens } from '../helpers'
import { ITO_CONTRACT_BASE_TIMESTAMP, MSG_DELIMITER } from '../../constants'
import type { AdvanceSettingData } from '../AdvanceSetting'
import { useI18N } from '../../../../utils/i18n-next-ui'

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
    exchangeTokens: FungibleTokenDetailed[]
    token?: ERC20TokenDetailed
    advanceSettingData: AdvanceSettingData
}

type paramsObjType = {
    password: string
    startTime: number
    endTime: number
    message: string
    exchangeAddrs: string[]
    ratios: string[]
    unlockTime: number
    tokenAddrs: string
    total: string
    limit: string
    qualificationAddress: string
    exchangeAmountsDivided: (readonly [BigNumber, BigNumber])[]
    now: number
    invalidTokenAt: number
    exchangeAmounts: string[]
    exchangeTokens: FungibleTokenDetailed[]
    token: ERC20TokenDetailed | undefined
}

export function useFillCallback(poolSettings?: PoolSettings) {
    const web3 = useWeb3()
    const account = useAccount()
    const chainId = useChainId()
    const { contract: ITO_Contract } = useITO_Contract()
    const { t } = useI18N()
    const [fillState, setFillState] = useTransactionState()
    const [fillSettings, setFillSettings] = useState(poolSettings)
    const paramResult = useFillParams(poolSettings)

    const fillCallback = useCallback(async () => {
        if (!poolSettings) {
            setFillState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { password, startTime, endTime, token, unlockTime } = poolSettings

        if (!token || !ITO_Contract || !paramResult) {
            setFillState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { gas, params, paramsObj, gasError } = paramResult

        if (gasError) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: gasError,
            })
            return
        }
        if (!checkParams(paramsObj, setFillState)) return

        // error: unable to sign password
        let signedPassword = ''
        try {
            signedPassword = await web3.eth.personal.sign(password, account, '')
        } catch {
            signedPassword = ''
        }
        if (!signedPassword) {
            setFillState({
                type: TransactionStateType.FAILED,
                error: new Error(t('plugin_wallet_fail_to_sign')),
            })
            return
        }
        params[0] = Web3Utils.sha3(signedPassword)!

        // the given settings is valid
        setFillSettings({
            ...poolSettings,
            startTime: new Date(Math.floor(startTime.getTime() / 1000) * 1000),
            endTime: new Date(Math.floor(endTime.getTime() / 1000) * 1000),
            unlockTime: unlockTime ? new Date(Math.floor(unlockTime.getTime() / 1000) * 1000) : undefined,
            password: signedPassword,
            exchangeAmounts: paramsObj.exchangeAmountsDivided.flatMap((x) => x).map((y) => y.toFixed()),
        })

        // start waiting for provider to confirm tx
        setFillState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config = {
            from: account,
            gas,
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = (ITO_Contract as ITO2).methods.fill_pool(...params).send(config as NonPayableTx)

            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setFillState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                })
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setFillState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setFillState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setFillState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [web3, account, chainId, ITO_Contract, poolSettings, paramResult, setFillState])

    const resetCallback = useCallback(() => {
        setFillState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [fillSettings, fillState, fillCallback, resetCallback] as const
}

export function useFillParams(poolSettings: PoolSettings | undefined) {
    const { contract: ITO_Contract } = useITO_Contract()
    const account = useAccount()

    return useAsync(async () => {
        if (!poolSettings || !ITO_Contract) return null
        const {
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

        // sort amounts and tokens
        const sorted = exchangeAmountsUnsorted
            .map((x, i) => ({
                amount: x,
                token: exchangeTokensUnsorted[i],
            }))
            .sort((unsortedA, unsortedB) => sortTokens(unsortedA.token, unsortedB.token))

        const exchangeAmounts = sorted.map((x) => x.amount)
        const exchangeTokens = sorted.map((x) => x.token)

        const startTime_ = Math.floor((startTime.getTime() - ITO_CONTRACT_BASE_TIMESTAMP) / 1000)
        const endTime_ = Math.floor((endTime.getTime() - ITO_CONTRACT_BASE_TIMESTAMP) / 1000)
        const unlockTime_ = unlockTime ? Math.floor((unlockTime.getTime() - ITO_CONTRACT_BASE_TIMESTAMP) / 1000) : 0
        const now = Math.floor((Date.now() - ITO_CONTRACT_BASE_TIMESTAMP) / 1000)

        const ONE_TOKEN = ONE.multipliedBy(pow10(token!.decimals ?? 0))
        const exchangeAmountsDivided = exchangeAmounts.map((x, i) => {
            const amount = new BigNumber(x)
            const divisor = gcd(ONE_TOKEN, amount)
            return [amount.dividedToIntegerBy(divisor), ONE_TOKEN.dividedToIntegerBy(divisor)] as const
        })
        const totalAmount = new BigNumber(total)
        const invalidTokenAt = exchangeAmountsDivided.findIndex(([tokenAmountA, tokenAmountB]) =>
            totalAmount.multipliedBy(tokenAmountA).dividedToIntegerBy(tokenAmountB).isZero(),
        )

        const paramsObj: paramsObjType = {
            //#region tx function params
            password: FAKE_SIGN_PASSWORD,
            startTime: startTime_,
            endTime: endTime_,
            message: [name, title, regions].join(MSG_DELIMITER),
            exchangeAddrs: exchangeTokens.map((x) => x.address),
            ratios: exchangeAmountsDivided.flatMap((x) => x).map((y) => y.toFixed()),
            unlockTime: unlockTime_,
            tokenAddrs: token!.address,
            total,
            limit,
            qualificationAddress,
            //#endregion

            //#region params for FE verify and fill settings
            exchangeAmountsDivided,
            now,
            invalidTokenAt,
            exchangeAmounts,
            exchangeTokens,
            token,
            //#endregion
        }

        if (!checkParams(paramsObj)) return null

        const params = Object.values(
            omit(paramsObj, [
                'exchangeAmountsDivided',
                'now',
                'invalidTokenAt',
                'exchangeAmounts',
                'exchangeTokens',
                'token',
            ]),
        ) as Parameters<ITO2['methods']['fill_pool']>

        let gasError = null as Error | null
        const gas = (await (ITO_Contract as ITO2).methods
            .fill_pool(...params)
            .estimateGas({
                from: account,
            })
            .catch((error: Error) => {
                gasError = error
            })) as number | undefined

        return { gas, params, paramsObj, gasError }
    }, [poolSettings]).value
}

function checkParams(paramsObj: paramsObjType, setFillState?: (value: React.SetStateAction<TransactionState>) => void) {
    // error: the start time before BASE TIMESTAMP
    if (paramsObj.startTime < 0) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Invalid start time.'),
        })
        return false
    }

    // error: the end time before BASE TIMESTAMP
    if (paramsObj.endTime < 0) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Invalid end time.'),
        })
        return false
    }

    // error: the unlock time before BASE TIMESTAMP
    if (paramsObj.unlockTime < 0) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Invalid unlock time.'),
        })
        return false
    }

    // error: the start time after the end time
    if (paramsObj.startTime >= paramsObj.endTime) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('The start date should before the end date.'),
        })
        return false
    }

    // error: the end time before now
    if (paramsObj.endTime <= paramsObj.now) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('The end date should be a future date.'),
        })
        return false
    }

    // error: unlock time before end time
    if (paramsObj.endTime >= paramsObj.unlockTime && paramsObj.unlockTime !== 0) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('The unlock date should be later than end date.'),
        })
        return false
    }

    // error: limit greater than the total supply
    if (isGreaterThan(paramsObj.limit, paramsObj.total)) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Limits should less than the total supply.'),
        })
        return false
    }

    // error: exceed the max available total supply
    if (isGreaterThan(paramsObj.total, '2e128')) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Exceed the max available total supply'),
        })
        return false
    }

    // error: The size of amounts and the size of tokens not match
    if (paramsObj.exchangeAmounts.length !== paramsObj.exchangeTokens.length) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Cannot match amounts with tokens.'),
        })
        return false
    }

    // error: token amount is not enough for dividing into integral pieces
    if (paramsObj.invalidTokenAt >= 0) {
        setFillState?.({
            type: TransactionStateType.FAILED,
            error: new Error(
                `Cannot swap enough ${paramsObj.token!.symbol ?? ''} out with ${
                    paramsObj.exchangeTokens[paramsObj.invalidTokenAt].symbol ?? ''
                }`,
            ),
        })
        return false
    }

    return true
}
