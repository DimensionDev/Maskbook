import { CoinGeckoTrending_API, CoinGeckoPriceSolanaAPI, CoinGeckoPriceEVM_API } from './CoinGecko/index.js'
import { OpenSeaAPI } from './OpenSea/index.js'
import { LooksRareAPI } from './LooksRare/index.js'
import { RaribleAPI } from './Rarible/index.js'
import {
    NFTScanTrendingAPI,
    NFTScanNonFungibleTokenAPI_EVM,
    NFTScanNonFungibleTokenAPI_Solana,
} from './NFTScan/index.js'
import { ZoraAPI } from './Zora/index.js'
import { NativeExplorerAPI } from './Explorer/index.js'
import { RiskWarningAPI } from './RiskWarning/index.js'
import { RSS3API } from './RSS3/index.js'
import { KeyValueAPI } from './KV/index.js'
import { TwitterAPI } from './Twitter/index.js'
import { R2D2API } from './R2D2/index.js'
import { InstagramAPI } from './Instagram/index.js'
import { DeBankAPI } from './DeBank/index.js'
import { ZerionAPI, ZerionGasAPI, ZerionNonFungibleTokenAPI, ZerionTrendingAPI } from './Zerion/index.js'
import { MaskAPI } from './Mask/index.js'
import { MaskX_API } from './MaskX/index.js'
import { MetaSwapAPI } from './MetaSwap/index.js'
import { AstarAPI } from './Astar/index.js'
import { GoPlusLabsAPI, GoPlusAuthorizationAPI } from './GoPlusLabs/index.js'
import { NextIDProofAPI, NextIDStorageAPI } from './NextID/index.js'
import { AlchemyEVM_API, AlchemyFlowAPI } from './Alchemy/index.js'
import { Web3GasOptionAPI } from './EVM/index.js'
import { MagicEdenAPI } from './MagicEden/index.js'
import { CoinMarketCapAPI } from './CoinMarketCap/index.js'
import { UniSwapAPI } from './Uniswap/index.js'
import { RabbyAPI } from './Rabby/index.js'
import { GemAPI } from './Gem/index.js'
import { X2Y2API } from './X2Y2/index.js'
import {
    ChainbaseHistoryAPI,
    ChainbaseFungibleTokenAPI,
    ChainbaseNonFungibleTokenAPI,
    ChainbaseDomainAPI,
} from './Chainbase/index.js'
import { SolanaFungibleAPI, SolanaNonFungibleAPI } from './Solana/index.js'
import { FlowFungibleAPI } from './Flow/index.js'
import { CloudflareAPI } from './Cloudflare/index.js'
import { MirrorAPI } from './Mirror/index.js'
import { MindsAPI } from './Minds/index.js'
import { FuseTrendingAPI } from './Fuse/index.js'
import { CryptoScamDBAPI } from './CryptoScamDB/index.js'
import { SmartPayBundlerAPI } from './SmartPay/index.js'
import { NomicsAPI } from './Nomics/index.js'
import { DSearchAPI } from './DSearch/index.js'
import { MulticallAPI } from './Multicall/index.js'
import { ENS_API } from './ENS/index.js'
import { SpaceID_API } from './SpaceID/index.js'

export * from './types/index.js'

export const OpenSea = new OpenSeaAPI()
export const LooksRare = new LooksRareAPI()
export const MagicEden = new MagicEdenAPI()
export const Rarible = new RaribleAPI()
export const Zora = new ZoraAPI()
export const Gem = new GemAPI()
export const CoinGeckoTrending = new CoinGeckoTrending_API()
export const CoinGeckoPriceEVM = new CoinGeckoPriceEVM_API()
export const CoinGeckoPriceSolana = new CoinGeckoPriceSolanaAPI()
export const Explorer = new NativeExplorerAPI()
export const RiskWarning = new RiskWarningAPI()
export const RSS3 = new RSS3API()
export const KeyValue = new KeyValueAPI()
export const Twitter = new TwitterAPI()
export const Mask = new MaskAPI()
export const MaskX = new MaskX_API()
export const Minds = new MindsAPI()
export const Instagram = new InstagramAPI()
export const GoPlusLabs = new GoPlusLabsAPI()
export const GoPlusAuthorization = new GoPlusAuthorizationAPI()
export const R2D2 = new R2D2API()
export const DeBank = new DeBankAPI()
export const DSearch = new DSearchAPI()

export const MetaSwap = new MetaSwapAPI()
export const AstarGas = new AstarAPI()
export const NextIDProof = new NextIDProofAPI()
export const NextIDStorage = new NextIDStorageAPI()
export const EthereumWeb3 = new Web3GasOptionAPI()
export const Nomics = new NomicsAPI()
export const CoinMarketCap = new CoinMarketCapAPI()
export const UniSwap = new UniSwapAPI()
export const Rabby = new RabbyAPI()
export const X2Y2 = new X2Y2API()
export const Cloudflare = new CloudflareAPI()
export const Mirror = new MirrorAPI()
export const CryptoScamDB = new CryptoScamDBAPI()

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
export const ChainbaseDomain = new ChainbaseDomainAPI()

// Zerion
export const Zerion = new ZerionAPI()
export const ZerionNonFungibleToken = new ZerionNonFungibleTokenAPI()
export const ZerionTrending = new ZerionTrendingAPI()
export const ZerionGas = new ZerionGasAPI()

// ENS
export const ENS = new ENS_API()

// SpaceID
export const SpaceID = new SpaceID_API()

// Fuse
export const FuseTrending = new FuseTrendingAPI()

// Smart Pay
export const SmartPayBundler = new SmartPayBundlerAPI()

// EVM multicall
export const Multicall = new MulticallAPI()
