import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    TransactionEventType,
    TransactionStateType,
    useTransactionState,
    useAccount,
    useChainId,
} from '@masknet/web3-shared-evm'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'

export function usePlaceBidCallback(is24Auction: boolean, editionNumber: string) {
    const account = useAccount()
    const chainId = useChainId()
    const { artistAcceptingBidsV2_contract, cANFTMarket_contract } = useCryptoArtAI_Contract()
    const [placeBidState, setPlaceBidState] = useTransactionState()

    const placeBidCallback = useCallback(
        async (priceInWei: number) => {
            if (!is24Auction && !artistAcceptingBidsV2_contract) {
                setPlaceBidState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }
            if (is24Auction && !cANFTMarket_contract) {
                setPlaceBidState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // start waiting for provider to confirm tx
            setPlaceBidState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: new BigNumber(priceInWei).toFixed(),
                gas: !is24Auction
                    ? await artistAcceptingBidsV2_contract?.methods
                          .placeBid(editionNumber)
                          .estimateGas({
                              from: account,
                              value: new BigNumber(priceInWei).toFixed(),
                          })
                          .catch((error) => {
                              setPlaceBidState({
                                  type: TransactionStateType.FAILED,
                                  error,
                              })
                              throw error
                          })
                    : await cANFTMarket_contract?.methods
                          .placeBid(editionNumber, ZERO_ADDRESS)
                          .estimateGas({
                              from: account,
                              value: new BigNumber(priceInWei).toFixed(),
                          })
                          .catch((error) => {
                              setPlaceBidState({
                                  type: TransactionStateType.FAILED,
                                  error,
                              })
                              throw error
                          }),
            }

            // send transaction and wait for hash
            return new Promise<void>(async (resolve, reject) => {
                if (!is24Auction) {
                    artistAcceptingBidsV2_contract?.methods
                        .placeBid(editionNumber)
                        .send(config as NonPayableTx)
                        .on(TransactionEventType.RECEIPT, (receipt) => {
                            setPlaceBidState({
                                type: TransactionStateType.CONFIRMED,
                                no: 0,
                                receipt,
                            })
                            resolve()
                        })
                        .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                            setPlaceBidState({
                                type: TransactionStateType.HASH,
                                hash,
                            })
                            resolve()
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            setPlaceBidState({
                                type: TransactionStateType.FAILED,
                                error,
                            })
                            reject(error)
                        })
                } else {
                    cANFTMarket_contract?.methods
                        .placeBid(editionNumber, ZERO_ADDRESS)
                        .send(config as NonPayableTx)
                        .on(TransactionEventType.RECEIPT, (receipt) => {
                            setPlaceBidState({
                                type: TransactionStateType.CONFIRMED,
                                no: 0,
                                receipt,
                            })
                            resolve()
                        })
                        .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                            setPlaceBidState({
                                type: TransactionStateType.HASH,
                                hash,
                            })
                            resolve()
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            setPlaceBidState({
                                type: TransactionStateType.FAILED,
                                error,
                            })
                            reject(error)
                        })
                }
            })
        },
        [account, chainId, is24Auction, editionNumber, artistAcceptingBidsV2_contract, cANFTMarket_contract],
    )

    const resetCallback = useCallback(() => {
        setPlaceBidState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [placeBidState, placeBidCallback, resetCallback] as const
}
