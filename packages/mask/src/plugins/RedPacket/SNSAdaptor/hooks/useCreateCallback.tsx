import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { isLessThan, toFixed } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    FungibleTokenDetailed,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTokenConstants,
    useTransactionState,
} from '@masknet/web3-shared-evm'
import { omit } from 'lodash-unified'
import { useCallback, useState } from 'react'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from './useRedPacketContract'

export interface RedPacketSettings {
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleTokenDetailed
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
    token?: FungibleTokenDetailed
}

function checkParams(paramsObj: ParamsObjType) {
    if (isLessThan(paramsObj.total, paramsObj.shares)) {
        throw new Error('At least [number of lucky drops] tokens to your lucky drop.')
    }

    if (paramsObj.shares <= 0) {
        throw new Error('At least 1 person should be able to claim the lucky drop.')
    }

    if (paramsObj.tokenType !== EthereumTokenType.Native && paramsObj.tokenType !== EthereumTokenType.ERC20) {
        throw new Error('Token not supported')
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
    const redPacketContract = useRedPacketContract(version)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const account = useAccount()
    const getCreateParams = useCallback(async (): Promise<CreateParams | null> => {
        if (!redPacketSettings || !redPacketContract) return null
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.type === EthereumTokenType.Native ? 0 : 1
        const tokenAddress = token!.type === EthereumTokenType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
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

        try {
            checkParams(paramsObj)
        } catch {
            return null
        }

        const params = Object.values(omit(paramsObj, ['token'])) as MethodParameters

        let gasError: Error | null = null
        const value = toFixed(paramsObj.token?.type === EthereumTokenType.Native ? total : 0)

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
    const account = useAccount()
    const chainId = useChainId()
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract(version)
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)
    const getCreateParams = useCreateParams(redPacketSettings, version, publicKey)

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])
    const createCallback = useCallback(async () => {
        resetCallback()
        const { token } = redPacketSettings
        const createParams = await getCreateParams()

        if (!token || !redPacketContract || !createParams) return

        const { gas, params, paramsObj, gasError } = createParams

        if (gasError) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: gasError,
            })
            return
        }

        try {
            checkParams(paramsObj)
        } catch (error) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: error as Error,
            })
        }

        setCreateSettings(redPacketSettings)

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // estimate gas and compose transaction
        const value = toFixed(token.type === EthereumTokenType.Native ? paramsObj.total : 0)
        const config: PayableTx = {
            from: account,
            value,
            gas,
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            redPacketContract.methods
                .create_red_packet(...params)
                .send(config)
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setCreateState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve(receipt.transactionHash)
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

    return [createSettings, createState, createCallback, resetCallback] as const
}
