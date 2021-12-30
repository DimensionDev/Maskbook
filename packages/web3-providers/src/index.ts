import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { RaribleAPI } from './rarible'
import { NFTScanAPI } from './NFTScan'

export * from './types'
export * from './opensea/utils'

export const OpenSea = new OpenSeaAPI()
export const Rarible = new RaribleAPI()
export const NFTScan = new NFTScanAPI()
export const CoinGecko = new CoinGeckoAPI()
