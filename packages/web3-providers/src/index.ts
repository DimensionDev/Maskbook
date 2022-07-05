import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { RaribleAPI } from './rarible'
import { NFTScanAPI } from './NFTScan'
import { ZoraAPI } from './zora'
import { NativeExplorerAPI } from './explorer'
import { RiskWarningAPI } from './risk-warning'
import { RSS3API } from './rss3'
import { KeyValueAPI } from './kv'
import { TwitterAPI } from './twitter'
import { TokenListAPI } from './token-list'
import { InstagramAPI } from './instagram'
import { DeBankAPI } from './debank'
import { ZerionAPI } from './zerion'
import { MetaSwapAPI } from './metaswap'
import { AstarAPI } from './astar'
import { GoPlusLabsAPI } from './gopluslabs'
import { NextIDProofAPI, NextIDStorageAPI } from './NextID'
import { Alchemy_EVM_API, Alchemy_FLOW_API } from './alchemy'
import { EthereumWeb3API } from './web3'
import { MagicEdenAPI } from './MagicEden'
import { CoinMarketCapAPI } from './CoinMarketCap'
import { UniSwapAPI } from './uniswap'

export * from './helpers'
export * from './types'
export * from './opensea/utils'

export const OpenSea = new OpenSeaAPI()
export const MagicEden = new MagicEdenAPI()
export const Rarible = new RaribleAPI()
export const NFTScan = new NFTScanAPI()
export const Zora = new ZoraAPI()
export const CoinGecko = new CoinGeckoAPI()
export const Explorer = new NativeExplorerAPI()
export const RiskWarning = new RiskWarningAPI()
export const RSS3 = new RSS3API()
export const KeyValue = new KeyValueAPI()
export const Twitter = new TwitterAPI()
export const Instagram = new InstagramAPI()
export const GoPlusLabs = new GoPlusLabsAPI()
export const TokenList = new TokenListAPI()
export const DeBank = new DeBankAPI()
export const Zerion = new ZerionAPI()
export const MetaSwap = new MetaSwapAPI()
export const AstarGas = new AstarAPI()
export const NextIDStorage = new NextIDStorageAPI()
export const EthereumWeb3 = new EthereumWeb3API()
export const NextIDProof = new NextIDProofAPI()
export const Alchemy_EVM = new Alchemy_EVM_API()
export const Alchemy_FLOW = new Alchemy_FLOW_API()
export const CoinMarketCap = new CoinMarketCapAPI()
export const UniSwap = new UniSwapAPI()
