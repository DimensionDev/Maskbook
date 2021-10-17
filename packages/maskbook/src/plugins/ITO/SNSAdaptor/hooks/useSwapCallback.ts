import type { ITO } from '@masknet/web3-contracts/types/ITO'
import type { ITO2 } from '@masknet/web3-contracts/types/ITO2'
import type { Qualification } from '@masknet/web3-contracts/types/Qualification'
import type { Qualification2 } from '@masknet/web3-contracts/types/Qualification2'
import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    currySameAddress,
    EthereumTokenType,
    FungibleTokenDetailed,
    isZero,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTransactionState,
    isSameAddress,
    useITOConstants,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import type { TransactionReceipt } from 'web3-core'
import Web3Utils from 'web3-utils'
import { buf2hex, hex2buf, useI18N } from '../../../../utils'
import { useITO_Contract } from './useITO_Contract'
import { useQualificationContract } from './useQualificationContract'
import type { JSON_PayloadInMask } from '../../types'
import { checkAvailability } from '../../Worker/apis/checkAvailability'

export function useSwapCallback(
    payload: JSON_PayloadInMask,
    total: string,
    token: Partial<FungibleTokenDetailed>,
    isQualificationHasLucky = false,
) {
    const { t } = useI18N()

    const account = useAccount()
    const chainId = useChainId()
    const { ITO_CONTRACT_ADDRESS } = useITOConstants()
    const { contract: ITO_Contract, version } = useITO_Contract(payload.contract_address)
    const [swapState, setSwapState] = useTransactionState()
    const { contract: qualificationContract } = useQualificationContract(
        payload.qualification_address,
        payload.contract_address,
    )

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
            const ifQualified = await (version === 1
                ? (qualificationContract as Qualification).methods.ifQualified(account)
                : (qualificationContract as Qualification2).methods.ifQualified(account, [])
            ).call({
                from: account,
            })
            if (!ifQualified) {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Not Qualified.'),
                })
                return
            }
        } catch {
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
            const availability = await checkAvailability(
                pid,
                account,
                payload.contract_address,
                chainId,
                isSameAddress(payload.contract_address, ITO_CONTRACT_ADDRESS),
            )
            if (isZero(availability.remaining)) {
                setSwapState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Out of Stock'),
                })
                return
            }
        } catch {
            setSwapState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to check availability.'),
            })
            return
        }

        const swapParamsV1 = [
            pid,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            Web3Utils.sha3(account)!,
            swapTokenAt,
            total,
        ] as Parameters<ITO['methods']['swap']>

        const swapParamsV2 = [
            pid,
            Web3Utils.soliditySha3(
                Web3Utils.hexToNumber(`0x${buf2hex(hex2buf(Web3Utils.sha3(password) ?? '').slice(0, 5))}`),
                account,
            )!,
            swapTokenAt,
            total,
            [],
        ] as Parameters<ITO2['methods']['swap']>

        // estimate gas and compose transaction
        const value = new BigNumber(token.type === EthereumTokenType.Native ? total : '0').toFixed()
        const config = {
            from: account,
            gas: isQualificationHasLucky
                ? 200000
                : await (version === 1
                      ? (ITO_Contract as ITO).methods.swap(...swapParamsV1)
                      : (ITO_Contract as ITO2).methods.swap(...swapParamsV2)
                  )
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
            const promiEvent = (
                version === 1
                    ? (ITO_Contract as ITO).methods.swap(...swapParamsV1)
                    : (ITO_Contract as ITO2).methods.swap(...swapParamsV2)
            ).send(config as PayableTx)

            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, onHash)
                .on(TransactionEventType.ERROR, onFailed)
                .on(TransactionEventType.CONFIRMATION, onSucceed)
                .on(TransactionEventType.RECEIPT, (receipt) => onSucceed(0, receipt))
        })
    }, [ITO_Contract, chainId, qualificationContract, account, payload, total, token.address, isQualificationHasLucky])

    const resetCallback = useCallback(() => {
        setSwapState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [swapState, swapCallback, resetCallback] as const
}
