import { useAsyncFn } from 'react-use'
import { ZERO_ADDRESS, TransactionEventType } from '@masknet/web3-shared-evm'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useCryptoArtAI_Contract } from './useCryptoArtAI_Contract'
import { NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { useAccount, useChainId } from '@masknet/plugin-infra/web3'

export function usePlaceBidCallback(is24Auction: boolean, editionNumber: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const { artistAcceptingBidsV2_contract, cANFTMarket_contract } = useCryptoArtAI_Contract(chainId)

    return useAsyncFn(
        async (priceInWei: number) => {
            if (!is24Auction && !artistAcceptingBidsV2_contract) return
            if (is24Auction && !cANFTMarket_contract) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                value: toFixed(priceInWei),
                gas: !is24Auction
                    ? await artistAcceptingBidsV2_contract?.methods.placeBid(editionNumber).estimateGas({
                          from: account,
                          value: toFixed(priceInWei),
                      })
                    : await cANFTMarket_contract?.methods.placeBid(editionNumber, ZERO_ADDRESS).estimateGas({
                          from: account,
                          value: toFixed(priceInWei),
                      }),
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                if (!is24Auction) {
                    artistAcceptingBidsV2_contract?.methods
                        .placeBid(editionNumber)
                        .send(config as NonPayableTx)
                        .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                            resolve(receipt.transactionHash)
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            reject(error)
                        })
                } else {
                    cANFTMarket_contract?.methods
                        .placeBid(editionNumber, ZERO_ADDRESS)
                        .send(config as NonPayableTx)
                        .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                            resolve(receipt.transactionHash)
                        })
                        .on(TransactionEventType.ERROR, (error) => {
                            reject(error)
                        })
                }
            })
        },
        [account, chainId, is24Auction, editionNumber, artistAcceptingBidsV2_contract, cANFTMarket_contract],
    )
}
