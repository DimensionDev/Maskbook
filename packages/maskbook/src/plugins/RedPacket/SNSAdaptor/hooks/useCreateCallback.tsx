import BigNumber from 'bignumber.js'
import { omit } from 'lodash-es'
import React, { useCallback, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    isLessThan,
    TransactionEventType,
    TransactionState,
    TransactionStateType,
    useAccount,
    useChainId,
    useTokenConstants,
    useTransactionState,
} from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'

export interface RedPacketSettings {
    publicKey: string
    privateKey: string
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleTokenDetailed
}

type paramsObjType = {
    publicKey: string
    shares: number
    isRandom: boolean
    duration: number
    seed: string
    message: string
    name: string
    tokenType: number
    tokenAddress: string
    total: string
    token?: FungibleTokenDetailed
}

function checkParams(
    paramsObj: paramsObjType,
    setCreateState?: (value: React.SetStateAction<TransactionState>) => void,
) {
    if (isLessThan(paramsObj.total, paramsObj.shares)) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: new Error('At least [number of lucky drops] tokens to your lucky drop.'),
        })
        return false
    }

    if (paramsObj.shares <= 0) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: new Error('At least 1 person should be able to claim the lucky drop.'),
        })
        return false
    }

    if (paramsObj.tokenType !== EthereumTokenType.Native && paramsObj.tokenType !== EthereumTokenType.ERC20) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Token not supported'),
        })
        return false
    }

    return true
}

export function useCreateParams(redPacketSettings: RedPacketSettings | undefined, version: number) {
    const redPacketContract = useRedPacketContract(version)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const account = useAccount()
    return useAsync(async () => {
        if (!redPacketSettings || !redPacketContract) return null
        const { duration, isRandom, message, name, shares, total, token, publicKey } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.type === EthereumTokenType.Native ? 0 : 1
        const tokenAddress = token!.type === EthereumTokenType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) return null

        const paramsObj: paramsObjType = {
            publicKey,
            shares,
            isRandom,
            duration,
            seed: Web3Utils.sha3(seed)!,
            message,
            name,
            tokenType,
            tokenAddress,
            total,
            token,
        }

        if (!checkParams(paramsObj)) return null

        type MethodParameters = Parameters<HappyRedPacketV4['methods']['create_red_packet']>
        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters

        let gasError = null as Error | null
        const value = new BigNumber(paramsObj.token?.type === EthereumTokenType.Native ? total : '0').toFixed()

        const gas = await (redPacketContract as HappyRedPacketV4).methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value })
            .catch((error: Error) => {
                gasError = error
            })

        return { gas: gas as number | undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract]).value
}

export function useCreateCallback(redPacketSettings: RedPacketSettings, version: number) {
    const account = useAccount()
    const chainId = useChainId()
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract(version)
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)
    const paramResult = useCreateParams(redPacketSettings, version)

    const transactionHashRef = useRef<string>()

    const createCallback = useCallback(async () => {
        const { token } = redPacketSettings

        if (!token || !redPacketContract || !paramResult) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { gas, params, paramsObj, gasError } = paramResult

        if (gasError) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: gasError,
            })
            return
        }

        if (!checkParams(paramsObj, setCreateState)) return

        setCreateSettings(redPacketSettings)

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const value = new BigNumber(token.type === EthereumTokenType.Native ? paramsObj.total : '0').toFixed()
        const config = {
            from: account,
            value,
            gas,
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = redPacketContract.methods.create_red_packet(...params).send(config as PayableTx)
            promiEvent.once(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                setCreateState({
                    type: TransactionStateType.WAIT_FOR_CONFIRMING,
                    hash,
                })
                transactionHashRef.current = hash
            })
            promiEvent.once(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
                transactionHashRef.current = receipt.transactionHash
            })

            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                transactionHashRef.current = receipt.transactionHash
                resolve()
            })

            promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                setCreateState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            })
        })
    }, [account, redPacketContract, redPacketSettings, chainId, paramResult])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
