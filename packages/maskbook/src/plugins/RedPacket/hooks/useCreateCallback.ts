import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import type { PayableTx } from '@dimensiondev/contracts/types/types'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useTransactionState,
    useNonce,
    useGasPrice,
} from '@dimensiondev/web3-shared'
import { isLessThan } from '@dimensiondev/maskbook-shared'
import type { TransactionReceipt } from 'web3-core'

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

export function useCreateCallback(redPacketSettings: RedPacketSettings) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract()
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)

    const createCallback = useCallback(async () => {
        const { password, duration, isRandom, message, name, shares, total, token } = redPacketSettings

        if (!token || !redPacketContract) {
            setCreateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error handling
        if (isLessThan(total, shares)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least [number of red packets] tokens to your red packet.'),
            })
            return
        }
        if (shares <= 0) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('At least 1 person should be able to claim the red packet.'),
            })
            return
        }
        if (token.type !== EthereumTokenType.Native && token.type !== EthereumTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('Token not supported'),
            })
            return
        }

        // start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const seed = Math.random().toString()
        const params: Parameters<typeof redPacketContract['methods']['create_red_packet']> = [
            Web3Utils.sha3(password)!,
            shares,
            isRandom,
            duration,
            Web3Utils.sha3(seed)!,
            message,
            name,
            token.type === EthereumTokenType.Native ? 0 : 1,
            token.type === EthereumTokenType.Native ? account : token.address, // this field must be a valid address
            total,
        ]

        // estimate gas and compose transaction
        const value = new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed()
        const config = {
            from: account,
            value,
            gas: await redPacketContract.methods
                .create_red_packet(...params)
                .estimateGas({
                    from: account,
                    value,
                })
                .catch((error) => {
                    setCreateState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            gasPrice,
            nonce,
        }

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = redPacketContract.methods.create_red_packet(...params).send(config as PayableTx)
            promiEvent.on(TransactionEventType.TRANSACTION_HASH, (hash: string) => {
                setCreateState({
                    type: TransactionStateType.HASH_WAIT,
                    hash,
                })
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setCreateSettings(redPacketSettings)
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
            })

            promiEvent.on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                setCreateSettings(redPacketSettings)
                setCreateState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            })

            promiEvent.on(TransactionEventType.ERROR, (error) => {
                setCreateState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            })
        })
    }, [nonce, gasPrice, account, redPacketContract, redPacketSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
