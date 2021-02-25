import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { buf2hex, hex2buf } from '../../../utils/utils'
import { addGasMargin, isSameAddress } from '../../../web3/helpers'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import type { MaskITO } from '@dimensiondev/contracts/types/MaskITO'
import { usePoolPayload } from './usePoolPayload'

export function useSwapCallback(
    id: string,
    password: string,
    total: string,
    token: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>,
    testNums?: number[],
    isMask = false,
) {
    const account = useAccount()
    const ITO_Contract = useITO_Contract(isMask)
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

        if (payload.end_time * 1000 < new Date().getTime()) {
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
            value: new BigNumber(token.type === EthereumTokenType.Ether ? total : '0').toFixed(),
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

        const swapParams =
            isMask && testNums
                ? ([
                      id,
                      Web3Utils.soliditySha3(
                          Web3Utils.hexToNumber(
                              `0x${buf2hex(
                                  hex2buf(
                                      Web3Utils.soliditySha3(Web3Utils.soliditySha3(...testNums) ?? '') ?? '',
                                  ).slice(0, 5),
                              )}`,
                          ),
                          account,
                      )!,
                      Web3Utils.soliditySha3(
                          Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                          account,
                      )!,
                      Web3Utils.sha3(account)!,
                      swapTokenAt,
                      total,
                  ] as Parameters<MaskITO['methods']['swap']>)
                : ([
                      id,
                      Web3Utils.soliditySha3(
                          Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 6))}`),
                          account,
                      )!,
                      account,
                      Web3Utils.sha3(account)!,
                      swapTokenAt,
                      total,
                  ] as Parameters<ITO['methods']['swap']>)

        const swap = isMask && testNums ? (ITO_Contract as MaskITO).methods.swap : (ITO_Contract as ITO).methods.swap

        // step 2-1: estimate gas
        const estimatedGas = await swap(...swapParams)
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
            const promiEvent = swap(...swapParams).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })

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
