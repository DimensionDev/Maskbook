import type { ITO } from '@dimensiondev/contracts/types/ITO'
import type { PayableTx } from '@dimensiondev/contracts/types/types'
import { isZero } from '@dimensiondev/maskbook-shared'
import {
    currySameAddress,
    EthereumTokenType,
    FungibleTokenDetailed,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useGasPrice,
    useNonce,
    useTransactionState,
} from '@dimensiondev/web3-shared'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import { buf2hex, hex2buf, useI18N } from '../../../utils'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { useQualificationContract } from '../contracts/useQualificationContract'
import type { JSON_PayloadInMask } from '../types'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: PartialRequired<FungibleTokenDetailed, 'address'>,
    isQualificationHasLucky = false,
) {
    const { t } = useI18N()

    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const account = useAccount()
    const ITO_Contract = useITO_Contract()
    const [swapState, setSwapState] = useTransactionState()
    const qualificationContract = useQualificationContract(payload.qualification_address)

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
        if (payload.end_time < Date.now()) {
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
        const swapTokenAt = payload.exchange_tokens.findIndex(currySameAddress(token.address))
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

        // start waiting for provider to confirm tx
        setSwapState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // check remaining
        try {
            const availability = await ITO_Contract.methods.check_availability(pid).call({
                from: account,
            })
            if (isZero(availability.remaining)) {
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

        // estimate gas and compose transaction
        const value = new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed()
        const config = {
            from: account,
            gas: isQualificationHasLucky
                ? 200000
                : await ITO_Contract.methods
                      .swap(...swapParams)
                      .estimateGas({
                          from: account,
                          value,
                      })
                      .catch((error) => {
                          setSwapState({
                              type: TransactionStateType.FAILED,
                              error,
                          })
                          throw error
                      }),
            gasPrice,
            nonce,
            value,
        }

        // send transaction and wait for hash
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
            const promiEvent = ITO_Contract.methods.swap(...swapParams).send(config as PayableTx)

            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, onHash)
                .on(TransactionEventType.ERROR, onFailed)
                .on(TransactionEventType.CONFIRMATION, onSucceed)
                .on(TransactionEventType.RECEIPT, (receipt) => onSucceed(0, receipt))
        })
    }, [
        gasPrice,
        nonce,
        ITO_Contract,
        qualificationContract,
        account,
        payload,
        total,
        token.address,
        isQualificationHasLucky,
    ])

    const resetCallback = useCallback(() => {
        setSwapState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [swapState, swapCallback, resetCallback] as const
}
