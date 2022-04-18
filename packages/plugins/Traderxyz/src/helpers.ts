/* eslint-disable no-restricted-imports */
/* eslint-disable spaced-comment */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { type TypedMessage, createTypedMessageMetadataReader } from '@masknet/typed-message'
//import { getAssetsList } from '../../../../../packages/mask/src/plugins/Wallet/apis/opensea'

import type { TradeMetaData } from './types'
import { META_KEY } from './constants'
import schema from './schema.json'
import type { Result } from 'ts-results'

const reader_v2 = createTypedMessageMetadataReader<TradeMetaData>(META_KEY, schema)

export function TradeMetadataReader(meta: TypedMessage['meta']): Result<TradeMetaData, void> {
    return reader_v2(meta)
}

export async function getNftList() {
    // return await getOpenSeaNFTList().then(
    //     (result: any) => {
    //         const asset_contract = [
    //             ...new Set(
    //                 result.data.map((ele: { contractDetailed: { address: any } }) => ele.contractDetailed.address),
    //             ),
    //         ]
    //         const final = asset_contract.map((ele: any) => {
    //             const t = result.data
    //                 .filter((ele1: { contractDetailed: { address: any } }) => ele1.contractDetailed.address === ele)
    //                 .map(function (ele2: {
    //                     id: any
    //                     tokenId: any
    //                     info: { name: any; imageURL: any }
    //                     is_selected: any
    //                     image_exist: any
    //                     contractDetailed: any
    //                 }) {
    //                     return {
    //                         id: ele2.tokenId,
    //                         token_id: ele2.tokenId,
    //                         name: ele2.info.name,
    //                         image_preview_url: ele2.info.imageURL,
    //                         image_thumbnail_url: ele2.info.imageURL,
    //                         is_selected: false,
    //                         asset_contract: ele2.contractDetailed,
    //                     }
    //                 })
    //             const r = result.data
    //                 .filter((ele1: { contractDetailed: { address: any } }) => ele1.contractDetailed.address === ele)
    //                 .map(function (ele2: { collection: { name: any }; contractDetailed: { address: any } }) {
    //                     return {
    //                         collection_name: ele2.collection.name,
    //                         contract_address: ele2.contractDetailed.address,
    //                     }
    //                 })
    //             const rBoj = {
    //                 ...r[0],
    //                 tokens: t,
    //             }
    //             return rBoj
    //         })
    //         return final
    //     },
    //     function (error) {
    //         return error
    //     },
    // )
}
