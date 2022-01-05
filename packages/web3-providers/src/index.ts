import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { RaribleAPI } from './rarible'
import { NFTScanAPI } from './NFTScan'
import { RSS3API } from './rss3'

export * from './types'
export * from './opensea/utils'

export const OpenSea = new OpenSeaAPI()
export const Rarible = new RaribleAPI()
export const NFTScan = new NFTScanAPI()
export const CoinGecko = new CoinGeckoAPI()
export const RSS3 = new RSS3API()

// Method for provider proxy
export { getOpenSeaNFTList, getOpenSeaCollectionList } from './opensea'
export { getAssetListFromDebank } from './debank'
export { getRaribleNFTList } from './rarible'
export { getAlchemyFlowNFTList } from './alchemy'
