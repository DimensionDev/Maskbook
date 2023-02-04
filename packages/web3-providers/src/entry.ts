import { CoinGeckoTrendingAPI, CoinGeckoPriceAPI_EVM, CoinGeckoPriceAPI_Solana } from './CoinGecko/index.js'
import { OpenSeaAPI } from './OpenSea/index.js'
import { LooksRareAPI } from './LooksRare/index.js'
import { RaribleAPI } from './Rarible/index.js'
import {
    NFTScanTrendingAPI_EVM,
    NFTScanTrendingAPI_Solana,
    NFTScanNonFungibleTokenAPI_EVM,
    NFTScanNonFungibleTokenAPI_Solana,
} from './NFTScan/index.js'
import { ZoraAPI } from './Zora/index.js'
import { EtherscanExplorerAPI, EtherscanRedPacketAPI } from './Etherscan/index.js'
import { RiskWarningAPI } from './RiskWarning/index.js'
import { TwitterAPI } from './Twitter/index.js'
import { R2D2DomainAPI, R2D2TokenListAPI } from './R2D2/index.js'
import { InstagramAPI } from './Instagram/index.js'
import { DeBankFungibleTokenAPI, DeBankGasOptionAPI, DeBankHistoryAPI } from './DeBank/index.js'
import { ZerionAPI, ZerionGasAPI, ZerionNonFungibleTokenAPI, ZerionTrendingAPI } from './Zerion/index.js'
import { MaskAPI } from './Mask/index.js'
import { MaskX_API } from './MaskX/index.js'
import { MetaSwapAPI } from './MetaSwap/index.js'
import { AstarAPI } from './Astar/index.js'
import { GoPlusLabsAPI, GoPlusAuthorizationAPI } from './GoPlusLabs/index.js'
import { NextIDProofAPI, NextIDStorageAPI } from './NextID/index.js'
import { AlchemyEVM_API, AlchemyFlowAPI } from './Alchemy/index.js'
import { MagicEdenAPI } from './MagicEden/index.js'
import { CoinMarketCapTrendingAPI } from './CoinMarketCap/index.js'
import { UniswapAPI } from './Uniswap/index.js'
import { RabbyAPI } from './Rabby/index.js'
import { GemAPI } from './Gem/index.js'
import { X2Y2API } from './X2Y2/index.js'
import {
    ChainbaseHistoryAPI,
    ChainbaseFungibleTokenAPI,
    ChainbaseNonFungibleTokenAPI,
    ChainbaseDomainAPI,
    ChainbaseRedPacketAPI,
} from './Chainbase/index.js'
import { CloudflareAPI } from './Cloudflare/index.js'
import { MirrorAPI } from './Mirror/index.js'
import { MindsAPI } from './Minds/index.js'
import { FuseAPI, FuseCoinAPI } from './Fuse/index.js'
import { FuseNonFungibleCollectionAPI } from './Fuse/apis/NonFungibleCollection.js'
import { CryptoScamDB_API } from './CryptoScamDB/index.js'
import { SmartPayAccountAPI, SmartPayBundlerAPI, SmartPayFunderAPI } from './SmartPay/index.js'
import { NomicsAPI } from './Nomics/index.js'
import { DSearchAPI } from './DSearch/index.js'
import { MulticallAPI } from './Multicall/index.js'
import { LensAPI } from './Lens/index.js'
import { Web3SignerAPI } from './Connection/EVM/apis/Web3SignerAPI.js'
import {
    Web3API,
    Web3GasOptionAPI,
    FlowWeb3API,
    FlowFungibleAPI,
    SolanaWeb3API,
    SolanaFungibleAPI,
    SolanaNonFungibleAPI,
} from './Connection/index.js'
import { SentryAPI } from './Sentry/index.js'
import { TheGraphDomainAPI, TheGraphRedPacketAPI } from './TheGraph/index.js'
import { ENS_API } from './ENS/index.js'
import { SpaceID_API } from './SpaceID/index.js'
import { ARBID_API } from './ARBID/index.js'
import { BonfidaAPI } from './Bonfida/index.js'
import { RedPacketAPI } from './RedPacket/index.js'
import { SmartPayOwnerAPI } from './SmartPay/apis/OwnerAPI.js'
import { SimpleHashAPI_EVM, SimpleHashAPI_Solana } from './SimpleHash/index.js'
import { RSS3API } from './RSS3/index.js'
import { LidoAPI } from './Lido/index.js'
import { Web3BioAPI } from './Web3Bio/index.js'
import { SnapshotAPI, SnapshotSearchAPI } from './Snapshot/index.js'
import { AirdropAPI } from './Airdrop/index.js'
import { FireflyAPI } from './Firefly/index.js'

export const OpenSea = new OpenSeaAPI()
export const Lido = new LidoAPI()
export const LooksRare = new LooksRareAPI()
export const MagicEden = new MagicEdenAPI()
export const Rarible = new RaribleAPI()
export const Zora = new ZoraAPI()
export const Gem = new GemAPI()
export const RiskWarning = new RiskWarningAPI()
export const Twitter = new TwitterAPI()
export const Mask = new MaskAPI()
export const MaskX = new MaskX_API()
export const Minds = new MindsAPI()
export const Instagram = new InstagramAPI()
export const DSearch = new DSearchAPI()
export const MetaSwap = new MetaSwapAPI()
export const AstarGas = new AstarAPI()
export const Nomics = new NomicsAPI()
export const CoinMarketCap = new CoinMarketCapTrendingAPI()
export const Uniswap = new UniswapAPI()
export const Rabby = new RabbyAPI()
export const X2Y2 = new X2Y2API()
export const Cloudflare = new CloudflareAPI()
export const Mirror = new MirrorAPI()
export const CryptoScamDB = new CryptoScamDB_API()
export const Multicall = new MulticallAPI()
export const Lens = new LensAPI()
export const Sentry = new SentryAPI()
export const TheGraphDomain = new TheGraphDomainAPI()
export const RedPacket = new RedPacketAPI()
export const TheGraphRedPacket = new TheGraphRedPacketAPI()
export const SimpleHashEVM = new SimpleHashAPI_EVM()
export const SimpleHashSolana = new SimpleHashAPI_Solana()
export const SnapshotSearch = new SnapshotSearchAPI()
export const Snapshot = new SnapshotAPI()

// Wallet
export {
    BaseContractWalletProvider,
    EVM_Providers,
    FlowProviders,
    SolanaProviders,
    EVM_Composers,
} from './Connection/index.js'

// EVM Connection
export const Web3 = new Web3API()
export const Web3GasOption = new Web3GasOptionAPI()
export const Web3Signer = new Web3SignerAPI()

// Flow Connection
export const FlowWeb3 = new FlowWeb3API()
export const FlowFungible = new FlowFungibleAPI()

// Solana Connection
export const SolanaWeb3 = new SolanaWeb3API()
export const SolanaFungible = new SolanaFungibleAPI()
export const SolanaNonFungible = new SolanaNonFungibleAPI()

// Etherscan
export const EtherscanExplorer = new EtherscanExplorerAPI()
export const EtherscanRedPacket = new EtherscanRedPacketAPI()

// NextID
export const NextIDProof = new NextIDProofAPI()
export const NextIDStorageProvider = new NextIDStorageAPI()
export type { LensAccount } from './NextID/index.js'

// Web3Bio
export const Web3Bio = new Web3BioAPI()
// GoPlusLabs
export const GoPlusLabs = new GoPlusLabsAPI()
export const GoPlusAuthorization = new GoPlusAuthorizationAPI()

// CoinGecko
export const CoinGeckoTrending = new CoinGeckoTrendingAPI()
export const CoinGeckoPriceEVM = new CoinGeckoPriceAPI_EVM()
export const CoinGeckoPriceSolana = new CoinGeckoPriceAPI_Solana()

// R2D2
export const R2D2TokenList = new R2D2TokenListAPI()
export const R2D2Domain = new R2D2DomainAPI()

// Name Service
export const ENS = new ENS_API()
export const ARBID = new ARBID_API()
export const SpaceID = new SpaceID_API()
export const Bonfida = new BonfidaAPI()

// Debank
export const DeBankGasOption = new DeBankGasOptionAPI()
export const DeBankFungibleToken = new DeBankFungibleTokenAPI()
export const DeBankHistory = new DeBankHistoryAPI()

// Alchemy
export const AlchemyEVM = new AlchemyEVM_API()
export const AlchemyFlow = new AlchemyFlowAPI()

// NFTScan
export const NFTScanTrending_EVM = new NFTScanTrendingAPI_EVM()
export const NFTScanTrending_Solana = new NFTScanTrendingAPI_Solana()
export const NFTScanNonFungibleTokenEVM = new NFTScanNonFungibleTokenAPI_EVM()
export const NFTScanNonFungibleTokenSolana = new NFTScanNonFungibleTokenAPI_Solana()

// Chainbase
export const ChainbaseHistory = new ChainbaseHistoryAPI()
export const ChainbaseFungibleToken = new ChainbaseFungibleTokenAPI()
export const ChainbaseNonFungibleToken = new ChainbaseNonFungibleTokenAPI()
export const ChainbaseDomain = new ChainbaseDomainAPI()
export const ChainbaseRedPacket = new ChainbaseRedPacketAPI()

// Zerion
export const Zerion = new ZerionAPI()
export const ZerionNonFungibleToken = new ZerionNonFungibleTokenAPI()
export const ZerionTrending = new ZerionTrendingAPI()
export const ZerionGas = new ZerionGasAPI()

// Fuse
export const Fuse = new FuseAPI()
export const FuseCoin = new FuseCoinAPI()
export const FuseNonFungibleCollection = new FuseNonFungibleCollectionAPI()

// Smart Pay
export const SmartPayBundler = new SmartPayBundlerAPI()
export const SmartPayFunder = new SmartPayFunderAPI()
export const SmartPayOwner = new SmartPayOwnerAPI()
export const SmartPayAccount = new SmartPayAccountAPI()

// RSS3
export const RSS3 = new RSS3API()

// Storage
export * from './Storage/index.js'

// Airdrop
export const Airdrop = new AirdropAPI()

// Firefly
export const Firefly = new FireflyAPI()
