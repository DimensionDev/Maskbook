import { useCallback, useMemo } from 'react'
import type { TransactionReceipt } from 'web3-core'
import BigNumber from 'bignumber.js'
import { once } from 'lodash-es'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { addGasMargin } from '../helpers'
import { TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useERC721TokenApprovedForAll } from './useERC721TokenApprovedForAll'
import { useERC721TokenIdsOfSpender } from './useERC721TokensOfSpender'
import { TransactionStateType, useTransactionState } from './useTransactionState'

export enum ApproveStateType {
    UNKNOWN,
    NOT_APPROVED,
    UPDATING,
    PENDING,
    APPROVED,
    FAILED,
}

export function useERC721TokenApproveCallback(address: string, spender: string, tokenIds: string[] = []) {
    const account = useAccount()
    const erc721Contract = useERC721TokenContract(address)
    const [transactionState, setTransactionState] = useTransactionState()

    const {
        value: approvedForAll,
        loading: loadingApprovedForAll,
        error: errorApprovedForAll,
        retry: revalidateApprovedForAll,
    } = useERC721TokenApprovedForAll(address, spender)

    const {
        value: tokenIdsOfSpender,
        loading: loadingTokenIdsOfSpender,
        error: errorTokenIdsOfSpender,
        retry: revalidateTokenIdsOfSpender,
    } = useERC721TokenIdsOfSpender(address, spender, tokenIds)

    // the computed approve state
    const approveStateType = useMemo(() => {
        if (!spender || !tokenIds.length || !erc721Contract) return ApproveStateType.UNKNOWN
        if (loadingApprovedForAll || loadingTokenIdsOfSpender) return ApproveStateType.UPDATING
        if (errorApprovedForAll || errorTokenIdsOfSpender) return ApproveStateType.FAILED
        if (transactionState.type === TransactionStateType.WAIT_FOR_CONFIRMING) return ApproveStateType.PENDING
        if (approvedForAll) return ApproveStateType.APPROVED
        if (tokenIds.length === tokenIdsOfSpender.length) return ApproveStateType.APPROVED
        return ApproveStateType.NOT_APPROVED
    }, [
        approvedForAll,
        transactionState,
        tokenIds,
        spender,
        tokenIdsOfSpender,
        loadingApprovedForAll,
        loadingTokenIdsOfSpender,
        errorApprovedForAll,
        errorTokenIdsOfSpender,
        erc721Contract,
    ])

    const approveCallback = useCallback(
        async (tokenId: string) => {
            if (!erc721Contract) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Failed to approve token.'),
                })
                return
            }

            // pre-step: start waiting for provider to confirm the tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            const config: Tx = {
                from: account,
                to: erc721Contract.options.address,
            }

            // step 1: estimate gas
            const estimatedGas = await erc721Contract.methods.approve(spender, tokenId).estimateGas(config)

            // step 2: blocking
            return new Promise<void>(async (resolve, reject) => {
                const promiEvent = erc721Contract.methods.approve(spender, tokenId).send({
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                })
                const revalidate = once(() => {
                    revalidateApprovedForAll()
                    revalidateTokenIdsOfSpender()
                })
                promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setTransactionState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    revalidate()
                    resolve()
                })
                promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    setTransactionState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    revalidate()
                    resolve()
                })
                promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                    setTransactionState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    revalidate()
                    reject(error)
                })
            })
        },
        [account, spender, erc721Contract, approveStateType, revalidateTokenIdsOfSpender, revalidateApprovedForAll],
    )

    const approveAllCallback = useCallback(async () => {
        if (!erc721Contract) {
            setTransactionState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // error: failed to approve token
        if (approveStateType !== ApproveStateType.NOT_APPROVED) {
            setTransactionState({
                type: TransactionStateType.FAILED,
                error: new Error('Failed to approve token.'),
            })
            return
        }

        // pre-step: start waiting for provider to confirm the tx
        setTransactionState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config: Tx = {
            from: account,
        }

        // step 1: estimate gas
        const estimatedGas = await erc721Contract.methods.setApprovalForAll(spender, true).estimateGas(config)

        // step 2: blocking
        return new Promise<void>(async (resolve, reject) => {
            const promiEvent = erc721Contract.methods.setApprovalForAll(spender, true).send({
                gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                ...config,
            })
            const revalidate = once(() => {
                revalidateApprovedForAll()
                revalidateTokenIdsOfSpender()
            })
            promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                setTransactionState({
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                })
                revalidate()
                resolve()
            })
            promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                setTransactionState({
                    type: TransactionStateType.CONFIRMED,
                    no,
                    receipt,
                })
                revalidate()
                resolve()
            })
            promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                revalidate()
                reject(error)
            })
        })
    }, [account, spender, erc721Contract, approveStateType, revalidateTokenIdsOfSpender, revalidateApprovedForAll])

    const resetCallback = useCallback(() => {
        revalidateApprovedForAll()
        revalidateTokenIdsOfSpender()
    }, [revalidateTokenIdsOfSpender, revalidateApprovedForAll])

    return [
        {
            type: approveStateType,
            tokenIdsOfSpender,
        },
        transactionState,
        approveCallback,
        approveAllCallback,
        resetCallback,
    ] as const
}
