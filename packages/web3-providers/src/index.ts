import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { RaribleAPI } from './rarible'
import { NFTScanAPI } from './NFTScan'
import { ZoraAPI } from './zora'
import { NativeExplorerAPI } from './explorer'
import { RiskWanringAPI } from './risk-warning'
import { RSS3API } from './rss3'
import { KeyValueAPI } from './kv'
import { TwitterAPI } from './twitter'
import { TokenListAPI } from './token-list'
import { InstagramAPI } from './instagram'
import { MaskAPI } from './mask'
import { DeBankAPI } from './debank'
import { ZerionAPI } from './zerion'
import { MetaSwapAPI } from './metaswap'
import { GoPlusLabsAPI } from './gopluslabs'
import { NextIDProofAPI, NextIDStorageAPI } from './NextID'

export * from './helpers'
export * from './types'
export * from './opensea/utils'

export const OpenSea = new OpenSeaAPI()
export const Rarible = new RaribleAPI()
export const NFTScan = new NFTScanAPI()
export const Zora = new ZoraAPI()
export const CoinGecko = new CoinGeckoAPI()
export const Explorer = new NativeExplorerAPI()
export const RiskWanring = new RiskWanringAPI()
export const RSS3 = new RSS3API()
export const KeyValue = new KeyValueAPI()
export const Twitter = new TwitterAPI()
export const Instagram = new InstagramAPI()
export const GoPlusLabs = new GoPlusLabsAPI()
export const TokenList = new TokenListAPI()
export const Mask = new MaskAPI()
export const DeBank = new DeBankAPI()
export const Zerion = new ZerionAPI()
export const MetaSwap = new MetaSwapAPI()
export const NextIDStorage = new NextIDStorageAPI()
export const NextIDProof = new NextIDProofAPI()
