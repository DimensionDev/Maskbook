import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { v4 as uuid } from 'uuid'
import Web3Utils from 'web3-utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { Token, EthereumTokenType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import type { Tx } from '../../../contracts/types'
import { addGasMargin } from '../../../web3/helpers'

export interface RedPacketSettings {
    shares: number
    duration: number
    isRandom: boolean
    total: string
    token: Token
    name: string
    message: string
}

export function useCreateRedPacketCallback(redPacketSettings: RedPacketSettings) {
    const account = useAccount()
    const [createRedPacketState, setCreateRedPacketState] = useTransactionState()
    const redPacketContract = useRedPacketContract()

    const createRedPacketCallback = useCallback(async () => {
        if (!redPacketContract) {
            setCreateRedPacketState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings

        // error handling
        if (new BigNumber(total).isLessThan(shares)) {
            setCreateRedPacketState({
                type: TransactionStateType.FAILED,
                error: new Error('At least [number of red packets] tokens to your red packet.'),
            })
            return
        }
        if (shares <= 0) {
            setCreateRedPacketState({
                type: TransactionStateType.FAILED,
                error: Error('At least 1 person should be able to claim the red packet.'),
            })
            return
        }
        if (token.type !== EthereumTokenType.Ether && token.type !== EthereumTokenType.ERC20) {
            setCreateRedPacketState({
                type: TransactionStateType.FAILED,
                error: Error('Token not supported'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setCreateRedPacketState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const password = uuid()
        const seed = Math.random().toString()
        const config: Tx = {
            from: account,
            to: redPacketContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? total : '0').toFixed(),
        }
        const params: Parameters<typeof redPacketContract['methods']['create_red_packet']> = [
            Web3Utils.sha3(password)!,
            shares,
            isRandom,
            duration,
            Web3Utils.sha3(seed)!,
            message,
            name,
            token.type === EthereumTokenType.Ether ? 0 : 1,
            token.type === EthereumTokenType.Ether ? account : token.address, // this field must be a valid address
            total,
        ]
        const estimatedGas = await redPacketContract.methods
            .create_red_packet(...params)
            .estimateGas(config)
            .catch((error) => {
                setCreateRedPacketState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            redPacketContract.methods.create_red_packet(...params).send(
                {
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                },
                (error, hash) => {
                    if (error) {
                        setCreateRedPacketState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setCreateRedPacketState({
                            type: TransactionStateType.SUCCEED,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [account, redPacketContract, redPacketSettings])

    return [createRedPacketState, createRedPacketCallback] as const
}
