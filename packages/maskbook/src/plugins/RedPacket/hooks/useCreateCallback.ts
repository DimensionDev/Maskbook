import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'
import Web3Utils from 'web3-utils'
import type { PayableTx } from '@dimensiondev/contracts/types/types'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { FungibleTokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import Services from '../../../extension/service'

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
        if (new BigNumber(total).isLessThan(shares)) {
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
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: redPacketContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed(),
            data: redPacketContract.methods.create_red_packet(...params).encodeABI(),
        }).catch((error) => {
            setCreateState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // send transaction and wait for hash
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = redPacketContract.methods.create_red_packet(...params).send(config as PayableTx)

            promiEvent
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setCreateSettings(redPacketSettings)
                    setCreateState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setCreateSettings(redPacketSettings)
                    setCreateState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setCreateState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, redPacketContract, redPacketSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
