import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { RaribleAPI } from './rarible'
import { NFTScanAPI } from './NFTScan'
import { NativeExplorerAPI } from './explorer'
import { RSS3API } from './rss3'
import { KeyValueAPI } from './kv'

export * from './types'
export * from './opensea/utils'

export const OpenSea = new OpenSeaAPI()
export const Rarible = new RaribleAPI()
export const NFTScan = new NFTScanAPI()
export const CoinGecko = new CoinGeckoAPI()
export const Explorer = new NativeExplorerAPI()
export const RSS3 = new RSS3API()
export const KeyValue = new KeyValueAPI()

// Method for provider proxy
export { getOpenSeaNFTList, getOpenSeaCollectionList } from './opensea'
export { getAssetListFromDebank } from './debank'
export { getRaribleNFTList } from './rarible'
export { getNFTScanNFTList, getNFTScanNFTs } from './NFTScan'
