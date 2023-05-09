import { NetworkPluginID } from '@masknet/shared-base'
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
import { SID_DomainAPI } from './SID/index.js'
import { SNSAdaptorContextAPI, SharedUIContextAPI } from './PluginContext/index.js'
import { ApprovalAPI } from './Approval/index.js'
import { ContractAPI } from './Web3/EVM/apis/ContractAPI.js'
import { SignerAPI } from './Web3/EVM/apis/SignerAPI.js'
import { Web3StateAPI } from './Web3/EVM/apis/Web3StateAPI.js'
import { FlowFungibleAPI } from './Web3/Flow/apis/FungibleTokenAPI.js'
import { FlowWeb3StateAPI } from './Web3/Flow/apis/Web3StateAPI.js'
import { SolanaDomainAPI } from './Web3/Solana/apis/DomainAPI.js'
import { SolanaFungibleTokenAPI } from './Web3/Solana/apis/FungibleTokenAPI.js'
import { SolanaNonFungibleTokenAPI } from './Web3/Solana/apis/NonFungibleTokenAPI.js'
import { SolanaWeb3StateAPI } from './Web3/Solana/apis/Web3StateAPI.js'
import { AllHubAPI } from './Web3/Router/apis/AllHubAPI.js'
import { AllConnectionAPI } from './Web3/Router/apis/AllConnectionAPI.js'
import { AllOthersAPI } from './Web3/Router/apis/AllOthersAPI.js'
import { Web3StorageAPI } from './Storage/apis/Storage.js'

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
export const Approval = new ApprovalAPI()

// Plugin Context
export const SharedUIPluginContext = new SharedUIContextAPI()
export const SNSAdaptorPluginContext = new SNSAdaptorContextAPI()

export { Providers } from './Web3/EVM/providers/index.js'
export { FlowProviders } from './Web3/Flow/providers/index.js'
export { SolanaProviders } from './Web3/Solana/providers/index.js'
export { BaseContractWalletProvider } from './Web3/EVM/providers/BaseContractWallet.js'

// Web3
export const Web3HubAll = new AllHubAPI()
export const Web3ConnectionAll = new AllConnectionAPI()
export const Web3OthersAll = new AllOthersAPI()

export const Web3Storage = new Web3StorageAPI()

export const Contract = new ContractAPI()
export const Signer = new SignerAPI()
export const Web3State = new Web3StateAPI()
export const Web3 = Web3ConnectionAll.use(NetworkPluginID.PLUGIN_EVM)!
export const Hub = Web3HubAll.use(NetworkPluginID.PLUGIN_EVM)!
export const Others = Web3OthersAll.use(NetworkPluginID.PLUGIN_EVM)!

export const FlowFungible = new FlowFungibleAPI()
export const FlowWeb3State = new FlowWeb3StateAPI()
export const FlowWeb3 = Web3ConnectionAll.use(NetworkPluginID.PLUGIN_FLOW)!
export const FlowHub = Web3HubAll.use(NetworkPluginID.PLUGIN_FLOW)!
export const FlowOthers = Web3OthersAll.use(NetworkPluginID.PLUGIN_FLOW)!

export const SolanaDomain = new SolanaDomainAPI()
export const SolanaFungible = new SolanaFungibleTokenAPI()
export const SolanaNonFungible = new SolanaNonFungibleTokenAPI()
export const SolanaWeb3State = new SolanaWeb3StateAPI()
export const SolanaWeb3 = Web3ConnectionAll.use(NetworkPluginID.PLUGIN_SOLANA)!
export const SolanaHub = Web3HubAll.use(NetworkPluginID.PLUGIN_SOLANA)!
export const SolanaOthers = Web3OthersAll.use(NetworkPluginID.PLUGIN_SOLANA)!

// Etherscan
export const EtherscanExplorer = new EtherscanExplorerAPI()
export const EtherscanRedPacket = new EtherscanRedPacketAPI()

// NextID
export const NextIDProof = new NextIDProofAPI()
export const NextIDStorageProvider = new NextIDStorageAPI()

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

// SID
export const SID_Domain = new SID_DomainAPI()

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

// Airdrop
export const Airdrop = new AirdropAPI()

// Firefly
export const Firefly = new FireflyAPI()
