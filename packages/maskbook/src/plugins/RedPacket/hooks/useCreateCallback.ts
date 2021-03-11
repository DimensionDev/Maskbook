import { useCallback, useState } from 'react'
import { BigNumber, CallOverrides } from 'ethers'
import { sha256 } from 'ethers/lib/utils'
import { useRedPacketContract } from '../contracts/useRedPacketContract'
import { useTransactionState, TransactionStateType } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed, StageType } from '../../../web3/types'
import { useAccount } from '../../../web3/hooks/useAccount'
import { watchTransaction } from '../../../web3/helpers/transaction'
import { unreachable } from '../../../utils/utils'

export interface RedPacketSettings {
    password: string
    shares: number
    duration: number
    isRandom: boolean
    total: string
    name: string
    message: string
    token?: EtherTokenDetailed | ERC20TokenDetailed
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
        if (BigNumber.from(total).lt(shares)) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error('At least the number of red packets tokens to your red packet.'),
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
        if (token.type !== EthereumTokenType.Ether && token.type !== EthereumTokenType.ERC20) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: Error('Token not supported'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const estimatedGas = await redPacketContract.estimateGas.create_red_packet(...params).catch((error) => {
            setCreateState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        const overrides: CallOverrides = {
            from: account,
            value: BigNumber.from(token.type === EthereumTokenType.Ether ? total : '0').toString(),
        }

        const seed = Math.random().toString()
        const params: Parameters<typeof redPacketContract['create_red_packet']> = [
            sha256(password)!,
            shares,
            isRandom,
            duration,
            sha256(seed)!,
            message,
            name,
            token.type === EthereumTokenType.Ether ? 0 : 1,
            token.type === EthereumTokenType.Ether ? account : token.address, // this field must be a valid address
            total,
            {
                ...overrides,
                gasLimit: estimatedGas,
            },
        ]

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const transaction = await redPacketContract.create_red_packet(...params)

            for await (const stage of watchTransaction(account, transaction)) {
                switch (stage.type) {
                    case StageType.TRANSACTION_HASH:
                        setCreateState({
                            type: TransactionStateType.HASH,
                            hash: stage.hash,
                        })
                        break
                    case StageType.RECEIPT:
                    case StageType.CONFIRMATION:
                        setCreateSettings(redPacketSettings)
                        setCreateState({
                            type: TransactionStateType.CONFIRMED,
                            no: stage.type === StageType.RECEIPT ? 0 : stage.no,
                            receipt: stage.receipt,
                        })
                        resolve()
                        break
                    case StageType.ERROR:
                        setCreateState({
                            type: TransactionStateType.FAILED,
                            error: stage.error,
                        })
                        reject(stage.error)
                        break
                    default:
                        unreachable(stage)
                }
            }
        })
    }, [account, redPacketContract, redPacketSettings])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
