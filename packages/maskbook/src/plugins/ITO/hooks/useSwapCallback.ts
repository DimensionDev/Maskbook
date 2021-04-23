import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import type { Tx } from '@dimensiondev/contracts/types/types'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import { buf2hex, hex2buf } from '../../../utils/utils'
import { addGasMargin, isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, NativeTokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { usePoolPayload } from './usePoolPayload'

export function useSwapCallback(
    id: string,
    password: string,
    total: string,
    token: PartialRequired<NativeTokenDetailed | ERC20TokenDetailed, 'address'>,
) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const { payload } = usePoolPayload(id)
    const [swapState, setSwapState] = useTransactionState()
    const swapCallback = useCallback(async () => {
        if (!ITO_Contract || !payload || !id) {
            setSwapState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        if (!password) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to swap token.'),
            })
            return
        }

        if (payload.end_time * 1000 < Date.now()) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Pool has expired.'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setSwapState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
            to: ITO_Contract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed(),
        }

        // error: invalid swap amount
        if (!new BigNumber(total).isPositive()) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Invalid swap amount.'),
            })
            return
        }

        // error: invalid token
        const swapTokenAt = payload.exchange_tokens.findIndex((x) => isSameAddress(x.address, token.address))
        if (swapTokenAt === -1) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error(`Unknown ${token.symbol} token.`),
            })
            return
        }

        // step 1: check remaining
        try {
            const availability = await ITO_Contract.methods.check_availability(id).call({
                from: account,
            })
            if (new BigNumber(availability.remaining).isZero()) {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Out of Stock'),
                })
                return
            }
        } catch (e) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to check availability.'),
            })
            return
        }

        const swapParams = [
            id,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            Web3Utils.sha3(account)!,
            swapTokenAt,
            total,
        ] as Parameters<ITO['methods']['swap']>

        // step 2-1: estimate gas
        const estimatedGas = await ITO_Contract.methods
            .swap(...swapParams)
            .estimateGas(config)
            .catch((error: Error) => {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2-2: blocking
        return new Promise<void>((resolve, reject) => {
            const onSucceed = (no: number, receipt: TransactionReceipt) => {
                setSwapState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                resolve()
            }
            const onFailed = (error: Error) => {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                reject(error)
            }
            const onHash = (hash: string) => {
                setSwapState({
                    type: TransactionStateType.HASH,
                    hash,
                })
                resolve()
            }
            const promiEvent = ITO_Contract.methods.swap(...swapParams).send({
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
            })
            promiEvent.on(TransactionEventType.TRANSACTION_HASH, onHash)
            promiEvent.on(TransactionEventType.ERROR, onFailed)
            promiEvent.on(TransactionEventType.CONFIRMATION, onSucceed)
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => onSucceed(0, receipt))
        })
    }, [ITO_Contract, id, password, account, payload, total, token.address])

    const resetCallback = useCallback(() => {
        setSwapState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [swapState, swapCallback, resetCallback] as const
}
