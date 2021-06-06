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
    useChainId,
    useTransactionState,
    useNonce,
    useGasPrice,
} from '@dimensiondev/web3-shared'
import { isLessThan } from '@dimensiondev/maskbook-shared'
import { useI18N } from '../../../utils/i18n-next-ui'
import type { TransactionReceipt } from 'web3-core'
import { RED_PACKET_CONTRACT_VERSION } from '../constants'
import type { HappyRedPacketV2 } from '@dimensiondev/contracts/types/HappyRedPacketV2'
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

export function useCreateCallback(redPacketSettings: Omit<RedPacketSettings, 'password'>) {
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const chainId = useChainId()
    const { t } = useI18N()
    const [createState, setCreateState] = useTransactionState()
    const redPacketContract = useRedPacketContract(RED_PACKET_CONTRACT_VERSION)
    const [createSettings, setCreateSettings] = useState<RedPacketSettings | null>(null)

    const createCallback = useCallback(async () => {
        const { duration, isRandom, message, name, shares, total, token } = redPacketSettings

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

        // error: unable to sign password
        let signedPassword = ''
        try {
            console.log({ message, account })
            signedPassword = await Services.Ethereum.personalSign(Web3Utils.sha3(message) ?? '', account)
            console.log({ signedPassword })
        } catch (e) {
            // it is trick, log(e) print {"code": 4001 ...}, log(e.code) print -1
            if (e.message === 'MetaMask Message Signature: User denied message signature.') {
                setCreateState({
                    type: TransactionStateType.FAILED,
                    error: new Error(t('plugin_wallet_cancel_sign')),
                })
                return
            }
            signedPassword = ''
        }
        if (!signedPassword) {
            setCreateState({
                type: TransactionStateType.FAILED,
                error: new Error(t('plugin_wallet_fail_to_sign')),
            })
            return
        }

        // it's trick, the password starts with '0x' would cause wrong password tx fail, so trim it.
        signedPassword = signedPassword!.slice(2)
        setCreateSettings({ ...redPacketSettings, password: signedPassword })

        // pre-step: start waiting for provider to confirm tx
        setCreateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const seed = Math.random().toString()
        const params: Parameters<HappyRedPacketV2['methods']['create_red_packet']> = [
            Web3Utils.sha3(signedPassword)!,
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
                .catch((error: any) => {
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
    }, [nonce, gasPrice, account, redPacketContract, redPacketSettings, chainId])

    const resetCallback = useCallback(() => {
        setCreateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [createSettings, createState, createCallback, resetCallback] as const
}
