import { useAsyncRetry } from 'react-use'
import type { NFTHistory } from '../types'
import { CollectibleProvider, OpenSeaAssetEventType } from '../types'
import { PluginCollectibleRPC } from '../messages'
import { NullAddress, NullContractAddress, OpenSeaAccountURL, RaribleUserURL } from '../constants'
import { CollectibleState } from './useCollectibleState'
import { toRaribleImage } from '../helpers'

export function useEvents(cursor?: string) {
    const { token, provider } = CollectibleState.useContainer()
    return useAsyncRetry<{ data: NFTHistory[]; pageInfo: { hasNextPage: boolean; endCursor?: string } }>(async () => {
        if (!token)
            return {
                data: [] as NFTHistory[],
                pageInfo: {
                    hasNextPage: false,
                },
            } as UnboxPromise<typeof PluginCollectibleRPC.getEvents>
        switch (provider) {
            case CollectibleProvider.OPENSEA:
                const openseaEvents = await PluginCollectibleRPC.getEvents(token.contractAddress, token.tokenId, cursor)
                return {
                    data: openseaEvents.edges.map((event) => {
                        const accountPair =
                            event.node.eventType === OpenSeaAssetEventType.SUCCESSFUL
                                ? {
                                      from: {
                                          username: event.node.seller?.user.publicUsername,
                                          address: event.node.seller?.address,
                                          imageUrl: event.node.seller?.imageUrl,
                                          link: `${OpenSeaAccountURL}${
                                              event.node.seller?.user.publicUsername ?? event.node.seller?.address
                                          }`,
                                      },
                                      to: {
                                          username: event.node.winnerAccount?.user.publicUsername,
                                          address: event.node.winnerAccount?.address,
                                          imageUrl: event.node.winnerAccount?.imageUrl,
                                          link: `${OpenSeaAccountURL}${
                                              event.node.winnerAccount?.user.publicUsername ??
                                              event.node.winnerAccount?.address
                                          }`,
                                      },
                                  }
                                : {
                                      from: {
                                          username: event.node.fromAccount?.user.publicUsername,
                                          address: event.node.fromAccount?.address,
                                          imageUrl: event.node.fromAccount?.imageUrl,
                                          link: `${OpenSeaAccountURL}${
                                              event.node.fromAccount?.user.publicUsername ??
                                              event.node.fromAccount?.address
                                          }`,
                                      },
                                      to: {
                                          username: event.node.toAccount?.user.publicUsername,
                                          address: event.node.toAccount?.address,
                                          imageUrl: event.node.toAccount?.imageUrl,
                                          link: `${OpenSeaAccountURL}${
                                              event.node.toAccount?.user.publicUsername ?? event.node.toAccount?.address
                                          }`,
                                      },
                                  }
                        return {
                            id: event.node.id,
                            accountPair,
                            price: {
                                quantity: event.node.price?.quantity,
                                asset: event.node.price?.asset,
                            },
                            assetQuantity: event.node.assetQuantity,
                            eventType: event.node.eventType,
                            transactionBlockExplorerLink: event.node.transaction?.blockExplorerLink,
                            timestamp: new Date(`${event.node.eventTimestamp}Z`).getTime(),
                        } as NFTHistory
                    }),
                    pageInfo: openseaEvents.pageInfo,
                }
            case CollectibleProvider.RARIBLE:
                const raribleEvents = await PluginCollectibleRPC.getHistoryFromRarible(
                    token.contractAddress,
                    token.tokenId,
                )
                return {
                    data: raribleEvents.map((event) => {
                        return {
                            id: event.salt,
                            accountPair: {
                                from: event.fromInfo
                                    ? {
                                          username:
                                              event.fromInfo?.id === NullContractAddress
                                                  ? NullAddress
                                                  : event.fromInfo?.name,
                                          address: event.fromInfo?.id,
                                          imageUrl: toRaribleImage(event.fromInfo?.image),
                                          link: `${RaribleUserURL}${event.fromInfo?.id ?? ''}`,
                                      }
                                    : null,
                                to: event.ownerInfo
                                    ? {
                                          username: event.ownerInfo?.name,
                                          address: event.ownerInfo?.id,
                                          imageUrl: toRaribleImage(event.ownerInfo?.image),
                                          link: `${RaribleUserURL}${event.ownerInfo?.id ?? ''}`,
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
                    pageInfo: {
                        hasNextPage: false,
                    },
                }
        }
    }, [token, cursor, provider])
}
