import { useCallback, useRef, useState } from 'react'
import { omit } from 'lodash-unified'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { FungibleToken, isLessThan, NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import {
    ChainId,
    SchemaType,
    TransactionEventType,
    TransactionState,
    TransactionStateType,
    useTokenConstants,
} from '@masknet/web3-shared-evm'
import { useRedPacketContract } from './useRedPacketContract'
import { useTransactionState } from '@masknet/plugin-infra/web3-evm'

export interface RedPacketSettings {
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

type ParamsObjType = {
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
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
}

function checkParams(paramsObj: ParamsObjType, setCreateState?: (value: TransactionState) => void) {
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

    if (paramsObj.tokenType !== SchemaType.Native && paramsObj.tokenType !== SchemaType.ERC20) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: new Error('Token not supported'),
        })
        return false
    }

    return true
}

type MethodParameters = Parameters<HappyRedPacketV4['methods']['create_red_packet']>
interface CreateParams {
    gas: number | undefined
    params: MethodParameters
    paramsObj: ParamsObjType
    gasError: Error | null
}

export function useCreateParams(redPacketSettings: RedPacketSettings | undefined, version: number, publicKey: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const redPacketContract = useRedPacketContract(chainId, version)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        if (!redPacketSettings || !redPacketContract) return null
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.schema === SchemaType.Native ? 0 : 1
        const tokenAddress = token!.schema === SchemaType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) {
            return null
        }

        const paramsObj: ParamsObjType = {
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

        if (!checkParams(paramsObj)) {
            return null
        }

        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters

        let gasError: Error | null = null
        const value = toFixed(paramsObj.token?.schema === SchemaType.Native ? total : 0)

        const gas = await (redPacketContract as HappyRedPacketV4).methods
            .create_red_packet(...params)
            .estimateGas({ from: account, value })
            .catch((error: Error) => {
                gasError = error
            })

        return { gas: gas as number | undefined, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract])

    return getCreateParams
}

export function useCreateCallback(redPacketSettings: RedPacketSettings, version: number, publicKey: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract(chainId, version)
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)
    const getCreateParams = useCreateParams(redPacketSettings, version, publicKey)

    const transactionHashRef = useRef<string>()

    const createCallback = useCallback(async () => {
        const { token } = redPacketSettings
        const createParams = await getCreateParams()

        if (!token || !redPacketContract || !createParams) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { gas, params, paramsObj, gasError } = createParams

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
        const value = toFixed(token.schema === SchemaType.Native ? paramsObj.total : 0)
        const config = {
            from: account,
            value,
            gas,
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            redPacketContract.methods
                .create_red_packet(...params)
                .send(config as PayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                    setCreateState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    transactionHashRef.current = hash
                })
                .on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setCreateState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    transactionHashRef.current = receipt.transactionHash
                    resolve()
                })
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    setCreateState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    transactionHashRef.current = receipt.transactionHash
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    setCreateState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, redPacketContract, redPacketSettings, chainId, getCreateParams])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
