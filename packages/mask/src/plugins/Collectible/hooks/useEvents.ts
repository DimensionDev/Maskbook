import { useAsyncRetry } from 'react-use'
import { ChainId, useChainId } from '@masknet/web3-shared-evm'
import { CollectibleToken, NFTHistory, CollectibleProvider, OpenSeaAssetEventType } from '../types'
import { PluginCollectibleRPC } from '../messages'
import { NullAddress, NullContractAddress, OpenSeaAccountURL } from '../constants'
import { toRaribleImage, toTokenIdentifier } from '../helpers'
import { resolveRaribleUserNetwork } from '../pipes'

export function useEvents(provider: CollectibleProvider, token?: CollectibleToken, page?: number, size?: number) {
    const chainId = useChainId()
    return useAsyncRetry<{ data: NFTHistory[]; hasNextPage: boolean }>(async () => {
        if (!token || (chainId !== ChainId.Mainnet && chainId !== ChainId.Ropsten))
            return {
                data: [] as NFTHistory[],
                hasNextPage: false,
            } as UnboxPromise<typeof PluginCollectibleRPC.getEvents>
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const openseaEvents = await PluginCollectibleRPC.getEvents(
                    token.contractAddress,
                    token.tokenId,
                    page,
                    size,
                )

                console.log(openseaEvents)
                return {
                    data: openseaEvents.map((event) => {
                        const accountPair =
                            event.event_type === OpenSeaAssetEventType.SUCCESSFUL
                                ? {
                                      from: {
                                          username: event.seller?.user?.username,
                                          address: event.seller?.address,
                                          imageUrl: event.seller?.profile_img_url,
                                          link: `${OpenSeaAccountURL}${
                                              event.seller?.user?.username ?? event.seller?.address
                                          }`,
                                      },
                                      to: {
                                          username: event.winner_account?.user?.username,
                                          address: event.winner_account?.address,
                                          imageUrl: event.winner_account?.profile_img_url,
                                          link: `${OpenSeaAccountURL}${
                                              event.winner_account?.user?.username ?? event.winner_account?.address
                                          }`,
                                      },
                                  }
                                : {
                                      from: {
                                          username: event.from_account?.user?.username,
                                          address: event.from_account?.address,
                                          imageUrl: event.from_account?.profile_img_url,
                                          link: `${OpenSeaAccountURL}${
                                              event.from_account?.user?.username ?? event.from_account?.address
                                          }`,
                                      },
                                      to: {
                                          username: event.to_account?.user?.username,
                                          address: event.to_account?.address,
                                          imageUrl: event.to_account?.profile_img_url,
                                          link: `${OpenSeaAccountURL}${
                                              event.to_account?.user?.username ?? event.to_account?.address
                                          }`,
                                      },
                                  }
                        return {
                            id: event.id,
                            accountPair,
                            price: {
                                quantity: event.quantity,
                                asset: event.asset,
                                paymentToken: event.payment_token,
                                price: event.bid_amount ?? event.ending_price ?? event.starting_price,
                            },
                            eventType: event.event_type,
                            transactionBlockExplorerLink: event.transaction?.blockExplorerLink,
                            timestamp: new Date(`${event.created_date}Z`).getTime(),
                        } as NFTHistory
                    }),
                    hasNextPage: openseaEvents.length === size,
                }

            case CollectibleProvider.RARIBLE:
                const raribleEvents = await PluginCollectibleRPC.getHistoryFromRarible(
                    token.contractAddress,
                    token.tokenId,
                )
                return {
                    data: raribleEvents.map((event) => {
                        return {
                            id: event.id,
                            accountPair: {
                                from: event.fromInfo
                                    ? {
                                          username:
                                              event.fromInfo?.id === NullContractAddress
                                                  ? NullAddress
                                                  : event.fromInfo?.name,
                                          address: event.fromInfo?.id,
                                          imageUrl: toRaribleImage(event.fromInfo?.image),
                                          link: `${resolveRaribleUserNetwork(chainId)}${event.fromInfo?.id ?? ''}`,
                                      }
                                    : null,
                                to: event.ownerInfo
                                    ? {
                                          username: event.ownerInfo?.name,
                                          address: event.ownerInfo?.id,
                                          imageUrl: toRaribleImage(event.ownerInfo?.image),
                                          link: `${resolveRaribleUserNetwork(chainId)}${event.ownerInfo?.id ?? ''}`,
                                      }
                                    : null,
                            },
                            eventType: event['@type'],
                            timestamp: new Date(event.date).getTime(),
                            price: event.price
                                ? {
                                      quantity: String(event.price),
                                  }
                                : null,
                        } as NFTHistory
                    }),

                    hasNextPage: false,
                }
        }
    }, [chainId, toTokenIdentifier(token), page, size, provider])
}
