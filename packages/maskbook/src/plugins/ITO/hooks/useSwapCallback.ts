import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import Web3Utils from 'web3-utils'
import type { TransactionReceipt } from 'web3-core'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import type { PayableTx } from '@dimensiondev/contracts/types/types'
import { isSameAddress } from '../../../web3/helpers'
import { buf2hex, hex2buf, useI18N } from '../../../utils'
import { useAccount } from '../../../web3/hooks/useAccount'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { NativeTokenDetailed, ERC20TokenDetailed, EthereumTokenType, TransactionEventType } from '../../../web3/types'
import { useITO_Contract } from '../contracts/useITO_Contract'
import { useQualificationContract } from '../contracts/useQualificationContract'
import Services from '../../../extension/service'
import type { JSON_PayloadInMask } from '../types'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: PartialRequired<NativeTokenDetailed | ERC20TokenDetailed, 'address'>,
    isQualificationHasLucky = false,
) {
    const { t } = useI18N()
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

        // start waiting for provider to confirm tx
        setSwapState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // check remaining
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

        // estimate gas and compose transaction
        const config = await Services.Ethereum.composeTransaction({
            from: account,
            to: ITO_Contract.options.address,
            gas: isQualificationHasLucky ? 200000 : undefined,
            value: new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed(),
            data: ITO_Contract.methods.swap(...swapParams).encodeABI(),
        }).catch((error) => {
            setSwapState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

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
    }, [ITO_Contract, qualificationContract, account, payload, total, token.address, isQualificationHasLucky])

    const resetCallback = useCallback(() => {
        setSwapState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [swapState, swapCallback, resetCallback] as const
}
