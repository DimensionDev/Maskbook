import type { ITO2 } from '@masknet/web3-contracts/types/ITO2'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { isGreaterThan, ONE } from '@masknet/web3-shared-base'
import {
    ERC20TokenDetailed,
    FAKE_SIGN_PASSWORD,
    FungibleTokenDetailed,
    TransactionEventType,
    useAccount,
    useChainId,
    useWeb3,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { omit } from 'lodash-unified'
import { useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import { ITO_CONTRACT_BASE_TIMESTAMP, MSG_DELIMITER } from '../../constants'
import type { AdvanceSettingData } from '../AdvanceSetting'
import { gcd, sortTokens } from '../helpers'
import { useITO_Contract } from './useITO_Contract'

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
    exchangeAmountsDivided: Array<readonly [BigNumber, BigNumber]>
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
    const [loading, setLoading] = useState(false)
    const [fillSettings, setFillSettings] = useState(poolSettings)
    const paramResult = useFillParams(poolSettings)

    const fillCallback = useCallback(async () => {
        if (!poolSettings) return

        const { password, startTime, endTime, token, unlockTime } = poolSettings

        if (!token || !ITO_Contract || !paramResult) return

        const { params, paramsObj } = paramResult

        if (!checkParams(paramsObj)) return

        setLoading(true)
        // error: unable to sign password
        let signedPassword = ''
        try {
            signedPassword = await web3.eth.personal.sign(password, account, '')
        } catch {
            signedPassword = ''
        }
        if (!signedPassword) {
            setLoading(false)
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

        const config = {
            from: account,
            gas: (await (ITO_Contract as ITO2).methods
                .fill_pool(...params)
                .estimateGas({
                    from: account,
                })
                .catch((error: Error) => {
                    setLoading(false)
                    return
                })) as number | undefined,
        }

        // send transaction and wait for hash
        return new Promise<TransactionReceipt>(async (resolve, reject) => {
            ;(ITO_Contract as ITO2).methods
                .fill_pool(...params)
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        }).finally(() => setLoading(false))
    }, [web3, account, chainId, ITO_Contract, poolSettings, paramResult])

    return [fillSettings, loading, fillCallback] as const
}

export function useFillParams(poolSettings: PoolSettings | undefined) {
    const { contract: ITO_Contract } = useITO_Contract()

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

        const ONE_TOKEN = ONE.shiftedBy(token!.decimals ?? 0)
        const exchangeAmountsDivided = exchangeAmounts.map((x) => {
            const amount = new BigNumber(x)
            const divisor = gcd(ONE_TOKEN, amount)
            return [amount.dividedToIntegerBy(divisor), ONE_TOKEN.dividedToIntegerBy(divisor)] as const
        })
        const totalAmount = new BigNumber(total)
        const invalidTokenAt = exchangeAmountsDivided.findIndex(([tokenAmountA, tokenAmountB]) =>
            totalAmount.multipliedBy(tokenAmountA).dividedToIntegerBy(tokenAmountB).isZero(),
        )

        const paramsObj: paramsObjType = {
            // #region tx function params
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
            // #endregion

            // #region params for FE verify and fill settings
            exchangeAmountsDivided,
            now,
            invalidTokenAt,
            exchangeAmounts,
            exchangeTokens,
            token,
            // #endregion
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

        return { params, paramsObj }
    }, [poolSettings]).value
}

function checkParams(paramsObj: paramsObjType) {
    // error: the start time before BASE TIMESTAMP
    if (paramsObj.startTime < 0) {
        return false
    }

    // error: the end time before BASE TIMESTAMP
    if (paramsObj.endTime < 0) {
        return false
    }

    // error: the unlock time before BASE TIMESTAMP
    if (paramsObj.unlockTime < 0) {
        return false
    }

    // error: the start time after the end time
    if (paramsObj.startTime >= paramsObj.endTime) {
        return false
    }

    // error: the end time before now
    if (paramsObj.endTime <= paramsObj.now) {
        return false
    }

    // error: unlock time before end time
    if (paramsObj.endTime >= paramsObj.unlockTime && paramsObj.unlockTime !== 0) {
        return false
    }

    // error: limit greater than the total supply
    if (isGreaterThan(paramsObj.limit, paramsObj.total)) {
        return false
    }

    // error: exceed the max available total supply
    if (isGreaterThan(paramsObj.total, '2e128')) {
        return false
    }

    // error: The size of amounts and the size of tokens not match
    if (paramsObj.exchangeAmounts.length !== paramsObj.exchangeTokens.length) {
        return false
    }

    // error: token amount is not enough for dividing into integral pieces
    if (paramsObj.invalidTokenAt >= 0) {
        return false
    }

    return true
}
