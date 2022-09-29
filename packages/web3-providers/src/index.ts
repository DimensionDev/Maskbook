import { CoinGeckoTrendingEVM_API, CoinGeckoPriceSolanaAPI, CoinGeckoPriceEVM_API } from './coingecko/index.js'
import { OpenSeaAPI } from './opensea/index.js'
import { LooksRareAPI } from './looksrare/index.js'
import { RaribleAPI } from './rarible/index.js'
import {
    NFTScanTrendingAPI,
    NFTScanNonFungibleTokenAPI_EVM,
    NFTScanNonFungibleTokenAPI_Solana,
} from './NFTScan/index.js'
import { ZoraAPI } from './zora/index.js'
import { NativeExplorerAPI } from './explorer/index.js'
import { RiskWarningAPI } from './risk-warning/index.js'
import { RSS3API } from './rss3/index.js'
import { KeyValueAPI } from './kv/index.js'
import { TwitterAPI } from './twitter/index.js'
import { R2D2API } from './r2d2/index.js'
import { InstagramAPI } from './instagram/index.js'
import { DeBankAPI } from './debank/index.js'
import { ZerionAPI } from './zerion/index.js'
import { MetaSwapAPI } from './metaswap/index.js'
import { AstarAPI } from './astar/index.js'
import { GoPlusLabsAPI } from './gopluslabs/index.js'
import { NextIDProofAPI, NextIDStorageAPI } from './NextID/index.js'
import { AlchemyEVM_API, AlchemyFlowAPI } from './alchemy/index.js'
import { EthereumWeb3API } from './web3/index.js'
import { MagicEdenAPI } from './MagicEden/index.js'
import { TokenViewAPI } from './token-view/index.js'
import { CoinMarketCapAPI } from './cmc/index.js'
import { UniSwapAPI } from './uniswap/index.js'
import { RabbyAPI } from './rabby/index.js'
import { GemAPI } from './gem/index.js'
import { X2Y2API } from './x2y2/index.js'
import {
    ChainbaseHistoryAPI,
    ChainbaseFungibleTokenAPI,
    ChainbaseNonFungibleTokenAPI,
    ChainBaseDomainAPI,
} from './chainbase/index.js'
import { SolanaFungibleAPI, SolanaNonFungibleAPI } from './solana/index.js'
import { FlowFungibleAPI } from './flow/index.js'
import { CF_API } from './cf/index.js'
import { MirrorAPI } from './mirror/index.js'

export * from './helpers.js'
export * from './types/index.js'
export * from './opensea/utils.js'
export { CollectionType } from './rss3/constants.js'

export const OpenSea = new OpenSeaAPI()
export const LooksRare = new LooksRareAPI()
export const MagicEden = new MagicEdenAPI()
export const Rarible = new RaribleAPI()
export const Zora = new ZoraAPI()
export const Gem = new GemAPI()
export const CoinGeckoTrendingEVM = new CoinGeckoTrendingEVM_API()
export const CoinGeckoPriceEVM = new CoinGeckoPriceEVM_API()
export const CoinGeckoPriceSolana = new CoinGeckoPriceSolanaAPI()
export const Explorer = new NativeExplorerAPI()
export const RiskWarning = new RiskWarningAPI()
export const RSS3 = new RSS3API()
export const KeyValue = new KeyValueAPI()
export const Twitter = new TwitterAPI()
export const Instagram = new InstagramAPI()
export const GoPlusLabs = new GoPlusLabsAPI()
export const R2D2 = new R2D2API()
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
export const CF = new CF_API()
export const Mirror = new MirrorAPI()

// Alchemy
export const AlchemyEVM = new AlchemyEVM_API()
export const AlchemyFlow = new AlchemyFlowAPI()

// Flow RPC
export const FlowFungible = new FlowFungibleAPI()

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
export const ChainbaseDomain = new ChainBaseDomainAPI()
