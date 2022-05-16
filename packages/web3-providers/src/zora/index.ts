import { GraphQLClient } from 'graphql-request'
import { first } from 'lodash-unified'
import {
    formatWeiToEther,
    ChainId,
    // FungibleTokenDetailed,
    // ERC721TokenDetailed,
    // EthereumTokenType,
    resolveIPFSLinkFromURL,
    SchemaType,
} from '@masknet/web3-shared-evm'

import type { ZoraToken, ZoraHistory, ZoraBid, ZoraAsk } from './types'
import type { NonFungibleTokenAPI } from '../types'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
// import { getAssetQuery, getTokenHistoryQuery, getBidsQuery, getAsksQuery } from './queries'
// import { ZORA_MAINNET_GRAPHQL_URL } from './constants'

// function createNFTAsset(asset: ZoraToken): NonFungibleAsset<ChainId, SchemaType> {
//     const image_url =
//         asset.metadata.json.image ?? asset.metadata.json.animation_url ?? asset.metadata.json.image_url ?? ''
//     const animation_url = asset.metadata.json.image ?? asset.metadata.json.animation_url ?? ''
//     return {
//         is_verified: false,
//         is_auction: asset.currentAuction !== null,
//         image_url: resolveIPFSLinkFromURL(image_url),
//         asset_contract: {
//             name: asset.tokenContract.name,
//             description: '',
//             schemaName: '',
//         },
//         current_price: asset.v3Ask ? formatWeiToEther(asset.v3Ask.askPrice).toNumber() : null,
//         current_symbol: asset.symbol ?? 'ETH',
//         owner: asset.owner
//             ? {
//                   address: asset.owner,
//                   profile_img_url: '',
//                   user: { username: asset.owner },
//                   link: `https://zora.co/${asset?.owner}`,
//               }
//             : null,
//         creator: asset.metadata.json.created_by
//             ? {
//                   address: asset.metadata.json.created_by,
//                   profile_img_url: '',
//                   user: { username: asset.metadata.json.created_by },
//                   link: `https://zora.co/${asset?.metadata.json.created_by}`,
//               }
//             : null,
//         token_id: asset.tokenId,
//         token_address: asset.address,
//         traits: asset.metadata.json.attributes,
//         safelist_request_status: '',
//         description: asset.metadata.json.description,
//         name: asset.name ?? asset.metadata.json.name,
//         collection_name: '',
//         animation_url: resolveIPFSLinkFromURL(animation_url),
//         end_time: asset.currentAuction ? new Date(asset.currentAuction.expiresAt) : null,
//         order_payment_tokens: [] as FungibleTokenDetailed[],
//         offer_payment_tokens: [] as FungibleTokenDetailed[],
//         slug: '',
//         top_ownerships: asset.owner
//             ? [
//                   {
//                       owner: {
//                           address: asset.owner,
//                           profile_img_url: '',
//                           user: { username: asset.owner },
//                           link: `https://zora.co/${asset.owner}`,
//                       },
//                   },
//               ]
//             : [],
//         response_: asset,
//         last_sale: null,
//     }
// }

// function createERC721TokenFromAsset(tokenAddress: string, tokenId: string, asset?: ZoraToken): ERC721TokenDetailed {
//     return {
//         contractDetailed: {
//             type: EthereumTokenType.ERC721,
//             chainId: ChainId.Mainnet,
//             address: tokenAddress,
//             name: asset?.tokenContract.name ?? '',
//             symbol: '',
//         },
//         info: {
//             name: asset?.metadata.json.name ?? '',
//             description: asset?.metadata.json.description ?? '',
//             mediaUrl: asset?.metadata.json.animation_url ?? asset?.metadata.json.image_url ?? '',
//             owner: asset?.owner,
//         },
//         tokenId,
//     }
// }

export class ZoraAPI {
    // private client
    // constructor() {
    //     this.client = new GraphQLClient(ZORA_MAINNET_GRAPHQL_URL)
    // }
    // async getAsset(address: string, tokenId: string) {
    //     const variables = {
    //         address,
    //         tokenId,
    //     }
    //     const assetData = await this.client.request(getAssetQuery, variables)
    //     if (!assetData) return
    //     return createNFTAsset(assetData.Token[0])
    // }
    // async getToken(address: string, tokenId: string) {
    //     const variables = {
    //         address,
    //         tokenId,
    //     }
    //     const asset = await this.client.request(getAssetQuery, variables)
    //     if (!asset) return
    //     return createERC721TokenFromAsset(address, tokenId, asset.Token[0])
    // }
    // async getHistory(address: string, tokenId: string): Promise<NonFungibleTokenAPI.History[]> {
    //     const variables = {
    //         address,
    //         tokenId,
    //     }
    //     const nftEventHistory = await this.client.request(getTokenHistoryQuery, variables)
    //     const history: NonFungibleTokenAPI.History[] = nftEventHistory.Token[0].transferEvents.map(
    //         (event: ZoraHistory): NonFungibleTokenAPI.History | undefined => {
    //             if (event.transaction.mediaMints?.length !== 0) {
    //                 const mint = first(event.transaction.mediaMints)
    //                 return {
    //                     id: mint?.id || '',
    //                     eventType: 'mint',
    //                     timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
    //                     price: {
    //                         quantity: '0',
    //                         price: '0',
    //                         paymentToken: {
    //                             name: 'Ether',
    //                             symbol: 'ETH',
    //                             decimals: 18,
    //                             address: '0x0000000000000000000000000000000000000000',
    //                         },
    //                     },
    //                     accountPair: {
    //                         from: {
    //                             username: '',
    //                             address: mint?.address,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${mint?.address}`,
    //                         },
    //                         to: {
    //                             username: '',
    //                             address: mint?.creator,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${mint?.creator}`,
    //                         },
    //                     },
    //                 }
    //             }
    //             if (event.transaction.auctionCreatedEvents?.length !== 0) {
    //                 const list = first(event.transaction.auctionCreatedEvents)
    //                 return {
    //                     id: list?.id || '',
    //                     eventType: 'List',
    //                     timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
    //                     price: {
    //                         quantity: list?.reservePrice ? formatWeiToEther(list?.reservePrice).toFixed(4) : '',
    //                         price: '1',
    //                         paymentToken: {
    //                             name: 'Ether',
    //                             symbol: 'ETH',
    //                             decimals: 18,
    //                             address: list?.auctionCurrency || '',
    //                         },
    //                     },
    //                     accountPair: {
    //                         from: {
    //                             username: list?.tokenOwner,
    //                             address: list?.tokenOwner,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${list?.tokenOwner}`,
    //                         },
    //                         to: {
    //                             username: '',
    //                             address: '',
    //                             imageUrl: '',
    //                             link: '',
    //                         },
    //                     },
    //                 }
    //             }
    //             if (event.transaction.marketBidEvents?.length !== 0) {
    //                 const bid = first(event.transaction.marketBidEvents)
    //                 return {
    //                     id: bid?.id || '',
    //                     eventType: 'Bid',
    //                     timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
    //                     price: {
    //                         quantity: bid?.amount ? formatWeiToEther(bid?.amount).toFixed(4) : '',
    //                         price: '1',
    //                         paymentToken: {
    //                             name: 'Ether',
    //                             symbol: 'ETH',
    //                             decimals: 18,
    //                             address: bid?.currencyAddress || '',
    //                         },
    //                     },
    //                     accountPair: {
    //                         from: {
    //                             username: bid?.bidder,
    //                             address: bid?.bidder,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${bid?.bidder}`,
    //                         },
    //                         to: {
    //                             username: bid?.recipient,
    //                             address: bid?.recipient,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${bid?.recipient}`,
    //                         },
    //                     },
    //                 }
    //             }
    //             if (event.transaction.auctionEndedEvents?.length !== 0) {
    //                 const buy = first(event.transaction.auctionEndedEvents)
    //                 return {
    //                     id: buy?.id || '',
    //                     eventType: 'Buy',
    //                     timestamp: new Date(`${event.blockTimestamp}Z`).getTime(),
    //                     price: {
    //                         quantity: buy?.auction.lastBidAmount
    //                             ? formatWeiToEther(buy?.auction.lastBidAmount).toFixed(4)
    //                             : '',
    //                         price: '1',
    //                         paymentToken: {
    //                             name: 'Ether',
    //                             symbol: 'ETH',
    //                             decimals: 18,
    //                             address: buy?.auction.auctionCurrency || '',
    //                         },
    //                     },
    //                     accountPair: {
    //                         from: {
    //                             username: buy?.tokenOwner,
    //                             address: buy?.tokenOwner,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${buy?.tokenOwner}`,
    //                         },
    //                         to: {
    //                             username: buy?.winner,
    //                             address: buy?.winner,
    //                             imageUrl: '',
    //                             link: `https://zora.co/${buy?.winner}`,
    //                         },
    //                     },
    //                 }
    //             }
    //             return
    //         },
    //     )
    //     return history.filter((event) => event !== undefined)
    // }
    // async getOffers(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenAPI.AssetOrder[]> {
    //     const variables = {
    //         tokenAddress,
    //         tokenId,
    //     }
    //     const nftBids = await this.client.request(getBidsQuery, variables)
    //     const offers: NonFungibleTokenAPI.AssetOrder[] = nftBids.Token[0].transferEvents.map(
    //         (event: ZoraBid): NonFungibleTokenAPI.AssetOrder | undefined => {
    //             if (event.transaction.marketBidEvents?.length !== 0) {
    //                 const bid = first(event.transaction.marketBidEvents)
    //                 return {
    //                     created_time: new Date(`${bid?.blockTimestamp}Z`).getTime().toString(),
    //                     current_price: bid?.amount,
    //                     payment_token: bid?.currencyAddress || '',
    //                     payment_token_contract: {
    //                         name: 'Ether',
    //                         symbol: 'ETH',
    //                         decimals: 18,
    //                         address: bid?.currencyAddress || '',
    //                     },
    //                     listing_time: 0,
    //                     side: NonFungibleTokenAPI.OrderSide.Buy,
    //                     quantity: '1',
    //                     expiration_time: 0,
    //                     order_hash: bid?.transactionHash || '',
    //                     approved_on_chain: false,
    //                     maker_account: {
    //                         user: { username: bid?.recipient || '' },
    //                         address: bid?.recipient || '',
    //                         profile_img_url: '',
    //                         link: `https://zora.co/${bid?.recipient}`,
    //                     },
    //                 }
    //             }
    //             return
    //         },
    //     )
    //     return offers.filter((offer) => offer !== undefined)
    // }
    // async getListings(tokenAddress: string, tokenId: string): Promise<NonFungibleTokenAPI.AssetOrder[]> {
    //     const variables = {
    //         tokenAddress,
    //         tokenId,
    //     }
    //     const nftAsks = await this.client.request(getAsksQuery, variables)
    //     const orders: NonFungibleTokenAPI.AssetOrder[] = nftAsks.Token[0].transferEvents.map(
    //         (event: ZoraAsk): NonFungibleTokenAPI.AssetOrder | undefined => {
    //             if (event.transaction.auctionCreatedEvents?.length !== 0) {
    //                 const ask = first(event.transaction.auctionCreatedEvents)
    //                 return {
    //                     created_time: new Date(`${ask?.blockTimestamp}Z`).getTime().toString(),
    //                     approved_on_chain: false,
    //                     current_price: formatWeiToEther(ask?.reservePrice || 0).toString(),
    //                     payment_token: ask?.auctionCurrency,
    //                     payment_token_contract: {
    //                         name: 'Ether',
    //                         symbol: 'ETH',
    //                         decimals: 18,
    //                         address: ask?.auctionCurrency || '',
    //                     },
    //                     listing_time: 0,
    //                     side: NonFungibleTokenAPI.OrderSide.Sell,
    //                     quantity: '1',
    //                     expiration_time: 0,
    //                     order_hash: ask?.transactionHash || '',
    //                     maker_account: {
    //                         user: { username: ask?.tokenOwner || '' },
    //                         address: ask?.tokenOwner || '',
    //                         profile_img_url: '',
    //                         link: `https://zora.co/${ask?.tokenOwner}`,
    //                     },
    //                 }
    //             }
    //             return
    //         },
    //     )
    //     return orders.filter((order) => order !== undefined)
    // }
    // async getOrders(tokenAddress: string, tokenId: string, side: NonFungibleTokenAPI.OrderSide) {
    //     switch (side) {
    //         case NonFungibleTokenAPI.OrderSide.Buy:
    //             return this.getOffers(tokenAddress, tokenId)
    //         case NonFungibleTokenAPI.OrderSide.Sell:
    //             return this.getListings(tokenAddress, tokenId)
    //         default:
    //             return []
    //     }
    // }
}
