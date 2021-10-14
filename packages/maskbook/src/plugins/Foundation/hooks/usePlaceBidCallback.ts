import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useTransactionState,
    useWeb3,
} from '@masknet/web3-shared'
import { useCallback, useMemo } from 'react'
import { useFoundationContract } from '../contracts/useFoundationContract'
import { useFoundationConstants } from '@masknet/web3-shared'
/**
 * A callback for place Bid
 * @param auctionId  id of nft in the market
 * @param amount
 */
export function usePlaceBidCallback(auctionId: string, amount: string) {
    const { MARKET_ADDRESS } = useFoundationConstants()
    const web3 = useWeb3()
    const foundationContract = useFoundationContract()
    const account = useAccount()
    const [placeBidState, setPlaceBidState] = useTransactionState()

    const bids = useMemo((): string[] => {
        if (!amount || !auctionId) return []
        if (!MARKET_ADDRESS) return []
        const bidAmount = amount
        const bidAuctionId = auctionId
        return [
            bidAuctionId, // id of nft in the market
            bidAmount, // bid price
        ]
    }, [auctionId, amount])

    const PlaceBidCallback = useCallback(async () => {
        if (!auctionId || !amount || !foundationContract || !bids.length) {
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
            gas: await foundationContract.methods
                .placeBid(auctionId)
                .estimateGas({
                    from: account,
                    value: amount,
                })
                .catch((error) => {
                    setPlaceBidState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
            value: amount,
        }

        // send transaction and wait for hash
        return new Promise<string>((resolve, reject) => {
            foundationContract.methods
                .placeBid(auctionId)
                .send(config as PayableTx)
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setPlaceBidState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setPlaceBidState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [web3, account, amount, auctionId, bids])

    const resetCallback = useCallback(() => {
        setPlaceBidState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [placeBidState, PlaceBidCallback, resetCallback] as const
}
