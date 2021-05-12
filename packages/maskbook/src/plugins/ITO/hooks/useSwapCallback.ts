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
import { ERC20TokenDetailed, EtherTokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { useQualificationContract } from '../contracts/useQualificationContract'
import type { JSON_PayloadInMask } from '../types'
import { useI18N } from '../../../utils/i18n-next-ui'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: PartialRequired<EtherTokenDetailed | ERC20TokenDetailed, 'address'>,
    isQualificationHasLucky = false,
) {
    const { t } = useI18N()
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const qualificationContract = useQualificationContract(payload.qualification_address)
    const [swapState, setSwapState] = useTransactionState()
    const swapCallback = useCallback(async () => {
        if (!ITO_Contract || !qualificationContract || !payload) {
            setSwapState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        const { pid, password } = payload

        // error: cannot find password
        if (!password) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to swap token.'),
            })
            return
        }

        // error: poll has expired
        if (payload.end_time * 1000 < Date.now()) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Pool has expired.'),
            })
            return
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

        // error: not qualified
        try {
            const ifQualified = await qualificationContract.methods.ifQualified(account).call({
                from: account,
            })
            if (!ifQualified) {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Not Qualified.'),
                })
                return
            }
        } catch (e) {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to read qualification.'),
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

        // step 1: check remaining
        try {
            const availability = await ITO_Contract.methods.check_availability(pid).call({
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
            pid,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            Web3Utils.sha3(account)!,
            swapTokenAt,
            total,
        ] as Parameters<ITO['methods']['swap']>

        // step 2-1: estimate gas
        const estimatedGas = isQualificationHasLucky
            ? null
            : await ITO_Contract.methods
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
                    reason: !receipt.events?.SwapSuccess ? t('plugin_ito_swap_unlucky_fail') : undefined,
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
                gas: estimatedGas ? addGasMargin(estimatedGas).toFixed() : 200000,
                ...config,
            })
            promiEvent.on(TransactionEventType.TRANSACTION_HASH, onHash)
            promiEvent.on(TransactionEventType.ERROR, onFailed)
            promiEvent.on(TransactionEventType.CONFIRMATION, onSucceed)
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => onSucceed(0, receipt))
        })
    }, [ITO_Contract, qualificationContract, account, payload, total, token.address, isQualificationHasLucky])

    const resetCallback = useCallback(() => {
        setSwapState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [swapState, swapCallback, resetCallback] as const
}
