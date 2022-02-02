import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { Bid as ShoyuBid } from '../sdk'

import {
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useTransactionState,
    useWeb3,
    useShoyuConstants,
} from '@masknet/web3-shared-evm'
import { useCallback, useMemo } from 'react'
import {
    useShoyuERC721ExchangeContract,
    useShoyuERC1155ExchangeContract,
    useShoyuDutchAuctionContract,
    useShoyuEnglishAuctionContract,
} from '../contracts/useShoyuContracts'

/**
 * A callback for place Bid
 * @param auctionId  id of nft in the market
 * @param amount
 */
export function usePlaceBidCallback(auctionId: string, amount: string) {
    const {
        SHOYU_DUTCH_AUCTION_EXCHANGE,
        SHOYU_ENGLISH_AUCTION_EXCHANGE,
        SHOYU_ERC1155_EXCHANGE,
        SHOYU_ERC721_EXCHANGE,
        SHOYU_REF_ADDRESS,
    } = useShoyuConstants()
    const web3 = useWeb3()
    const englishAuction = useShoyuEnglishAuctionContract()
    const dutchAuction = useShoyuDutchAuctionContract()
    const erc1155Exchange = useShoyuERC1155ExchangeContract()
    const erc721Exchange = useShoyuERC721ExchangeContract()
    const account = useAccount()
    const [placeBidState, setPlaceBidState] = useTransactionState()

    const bids = useMemo((): string[] => {
        if (!amount || !auctionId) return []
        if (!SHOYU_ERC1155_EXCHANGE || !SHOYU_ERC721_EXCHANGE) return []
        const bidAmount = amount
        const bidAuctionId = auctionId
        return [
            bidAuctionId, // id of nft in the market
            bidAmount, // bid price
        ]
    }, [auctionId, amount])

    const placeBidCallback = useCallback(async () => {
        if (!auctionId || !amount || !price || !askHash || !erc1155Exchange || !erc721Exchange || !bids.length) {
            setPlaceBidState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // start waiting for provider to confirm tx
        setPlaceBidState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const shoyuContract = !erc1155Exchange ? erc1155Exchange : erc721Exchange
        const shoyuConfBid = new ShoyuBid(askHash, account, amount, account.address, price, SHOYU_REF_ADDRESS)

        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await shoyuContract.methods
                .bestBid(auctionId)
                .estimateGas({
                    from: account,
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
            shoyuContract.methods[shoyuConfBid]
                .send(config as NonPayableTx)
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

    return [placeBidState, placeBidCallback, resetCallback] as const
}
