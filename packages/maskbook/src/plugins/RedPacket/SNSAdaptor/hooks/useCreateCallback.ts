import type { HappyRedPacketV2 } from '@masknet/web3-contracts/types/HappyRedPacketV2'
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
    useGasPrice,
    useNonce,
    useTokenConstants,
    useTransactionState,
    FAKE_SIGN_PASSWORD,
} from '@masknet/web3-shared'
import { omit } from 'lodash-es'
import { useAsync } from 'react-use'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import Services from '../../../../extension/service'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { useRedPacketContract } from './useRedPacketContract'

export interface RedPacketSettings {
    password: string
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: FungibleTokenDetailed
}

type paramsObjType = {
    password: string
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
            error: new Error('At least [number of red packets] tokens to your red packet.'),
        })
        return false
    }

    if (paramsObj.shares <= 0) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: Error('At least 1 person should be able to claim the red packet.'),
        })
        return false
    }

    if (paramsObj.tokenType !== EthereumTokenType.Native && paramsObj.tokenType !== EthereumTokenType.ERC20) {
        setCreateState?.({
            type: TransactionStateType.FAILED,
            error: Error('Token not supported'),
        })
        return false
    }

    return true
}

export function useCreateParams(redPacketSettings: Omit<RedPacketSettings, 'password'> | undefined, version: number) {
    const redPacketContract = useRedPacketContract(version)
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const account = useAccount()
    return useAsync(async () => {
        if (!redPacketSettings || !redPacketContract) return null
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings
        const seed = Math.random().toString()
        const tokenType = token!.type === EthereumTokenType.Native ? 0 : 1
        const tokenAddress = token!.type === EthereumTokenType.Native ? NATIVE_TOKEN_ADDRESS : token!.address
        if (!tokenAddress) return null

        const paramsObj: paramsObjType = {
            password: FAKE_SIGN_PASSWORD,
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

        const params = Object.values(omit(paramsObj, ['token'])) as Parameters<
            HappyRedPacketV2['methods']['create_red_packet']
        >

        let gasError = null as Error | null
        const value = new BigNumber(paramsObj.token?.type === EthereumTokenType.Native ? total : '0').toFixed()

        const gas = (await redPacketContract.methods
            .create_red_packet(...params)
            .estimateGas({
                from: account,
                value,
            })
            .catch((err: Error) => {
                gasError = err
            })) as number | undefined
        return { gas, params, paramsObj, gasError }
    }, [redPacketSettings, account, redPacketContract]).value
}

export function useCreateCallback(redPacketSettings: Omit<RedPacketSettings, 'password'>, version: number) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const chainId = useChainId()
    const { t } = useI18N()
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract(version)
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)
    const paramResult = useCreateParams(redPacketSettings, version)

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

        // error: unable to sign password
        let signedPassword = ''
        try {
            signedPassword = await Services.Ethereum.personalSign(Web3Utils.sha3(paramsObj.message) ?? '', account)
        } catch (error) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error,
            })
            return
        }
        if (!signedPassword) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error(t('plugin_wallet_fail_to_sign')),
            })
            return
        }

        // it's trick, the password starts with '0x' would cause wrong password tx fail, so trim it.
        signedPassword = signedPassword.slice(2)
        setCreateSettings({ ...redPacketSettings, password: signedPassword })

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        params[0] = Web3Utils.sha3(signedPassword)!

        // estimate gas and compose transaction
        const value = new BigNumber(token.type === EthereumTokenType.Native ? paramsObj.total : '0').toFixed()
        const config = {
            from: account,
            value,
            gas,
            gasPrice,
            nonce,
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = redPacketContract.methods.create_red_packet(...params).send(config as PayableTx)
            promiEvent.on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                setCreateState({
                    type: TransactionStateType.WAIT_FOR_CONFIRMING,
                    hash,
                })
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setCreateSettings({ ...redPacketSettings, password: signedPassword })
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
            })

            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setCreateSettings({ ...redPacketSettings, password: signedPassword })
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
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
    }, [nonce, gasPrice, account, redPacketContract, redPacketSettings, chainId, paramResult])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
