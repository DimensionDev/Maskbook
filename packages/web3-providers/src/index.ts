import { CoinGeckoAPI } from './coingecko'
import { OpenSeaAPI } from './opensea'
import { LooksRareAPI } from './looksrare'
import { RaribleAPI } from './rarible'
import { NFTScanTrendingAPI, NFTScanNonFungibleTokenAPI_EVM, NFTScanNonFungibleTokenAPI_Solana } from './NFTScan'
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
import { AlchemyEVM_API, AlchemyFlowAPI } from './alchemy'
import { EthereumWeb3API } from './web3'
import { MagicEdenAPI } from './MagicEden'
import { TokenViewAPI } from './token-view'
import { CoinMarketCapAPI } from './CoinMarketCap'
import { UniSwapAPI } from './uniswap'
import { RabbyAPI } from './rabby'
import { GemAPI } from './gem'
import { X2Y2API } from './x2y2'
import { ChainbaseHistoryAPI, ChainbaseFungibleTokenAPI, ChainbaseNonFungibleTokenAPI } from './chainbase'
import { SolanaFungibleAPI, SolanaNonFungibleAPI } from './solana'

export * from './helpers'
export * from './types'
export * from './opensea/utils'
export { CollectionType } from './rss3/constants'

export const OpenSea = new OpenSeaAPI()
export const LooksRare = new LooksRareAPI()
export const MagicEden = new MagicEdenAPI()
export const Rarible = new RaribleAPI()
export const Zora = new ZoraAPI()
export const Gem = new GemAPI()
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
export const TokenView = new TokenViewAPI()
export const CoinMarketCap = new CoinMarketCapAPI()
export const UniSwap = new UniSwapAPI()
export const Rabby = new RabbyAPI()
export const X2Y2 = new X2Y2API()

// Alchemy
export const AlchemyEVM = new AlchemyEVM_API()
export const AlchemyFlow = new AlchemyFlowAPI()

// Solana RPC
export const SolanaFungible = new SolanaFungibleAPI()
export const SolanaNonFungible = new SolanaNonFungibleAPI()

// NFTScan
export const NFTScanTrending = new NFTScanTrendingAPI()
export const NFTScanNonFungibleTokenEVM = new NFTScanNonFungibleTokenAPI_EVM()
export const NFTScanNonFungibleTokenSolana = new NFTScanNonFungibleTokenAPI_Solana()

// Chainbase
export const ChainbaseHistory = new ChainbaseHistoryAPI()
export const ChainbaseFungibleToken = new ChainbaseFungibleTokenAPI()
export const ChainbaseNonFungibleToken = new ChainbaseNonFungibleTokenAPI()
