import { NetworkPluginID } from '@masknet/shared-base'
import { SmartPayAccountAPI, SmartPayFunderAPI } from './SmartPay/index.js'
import { DSearchAPI } from './DSearch/index.js'
import { MulticallAPI } from './Multicall/index.js'
import { RedPacketAPI } from './RedPacket/index.js'
import { SmartPayOwnerAPI } from './SmartPay/apis/OwnerAPI.js'
import { AirdropAPI } from './Airdrop/index.js'
import { SharedContextAPI } from './PluginContext/index.js'
import { ContractAPI } from './Web3/EVM/apis/ContractAPI.js'
import { ContractReadonlyAPI } from './Web3/EVM/apis/ContractReadonlyAPI.js'
import { ConnectionReadonlyAPI } from './Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { RequestAPI } from './Web3/EVM/apis/RequestAPI.js'
import { RequestReadonlyAPI } from './Web3/EVM/apis/RequestReadonlyAPI.js'
import { Web3StateAPI } from './Web3/EVM/apis/Web3StateAPI.js'
import { FlowWeb3StateAPI } from './Web3/Flow/apis/Web3StateAPI.js'
import { SolanaWeb3StateAPI } from './Web3/Solana/apis/Web3StateAPI.js'
import { AllHubAPI } from './Web3/Router/apis/AllHubAPI.js'
import { AllConnectionAPI } from './Web3/Router/apis/AllConnectionAPI.js'
import { AllOthersAPI } from './Web3/Router/apis/AllOthersAPI.js'

export { Lido } from './Lido/index.js'
export { Twitter } from './Twitter/index.js'
export { Minds } from './Minds/index.js'
export { Instagram } from './Instagram/index.js'
export const DSearch = new DSearchAPI()
export { CoinMarketCap } from './CoinMarketCap/index.js'
export { Mirror } from './Mirror/index.js'
export { CryptoScamDB } from './CryptoScamDB/index.js'
export const Multicall = new MulticallAPI()
export { Lens } from './Lens/index.js'
export const RedPacket = new RedPacketAPI()
export { TheGraphRedPacket } from './TheGraph/index.js'
export { SimpleHashEVM } from './SimpleHash/index.js'
export { SnapshotSearch } from './Snapshot/index.js'
export { Snapshot } from './Snapshot/index.js'

// Plugin Context
export const SharedPluginContext = new SharedContextAPI()

export { Providers } from './Web3/EVM/providers/index.js'
export { FlowProviders } from './Web3/Flow/providers/index.js'
export { SolanaProviders } from './Web3/Solana/providers/index.js'
export { BaseContractWalletProvider } from './Web3/EVM/providers/BaseContractWallet.js'

// Web3
export const HubAll = new AllHubAPI()
export const Web3All = new AllConnectionAPI()
export const OthersAll = new AllOthersAPI()

export { ChainResolver, ExplorerResolver, ProviderResolver, NetworkResolver } from './Web3/EVM/apis/ResolverAPI.js'
export const Contract = new ContractAPI()
export const ContractReadonly = new ContractReadonlyAPI()
export { Signer } from './Web3/EVM/apis/SignerAPI.js'
export const Web3State = new Web3StateAPI()
export { Web3Storage } from './Storage/apis/Storage.js'
export const Web3 = Web3All.use(NetworkPluginID.PLUGIN_EVM)!
export const Web3Readonly = new ConnectionReadonlyAPI()
export const Request = new RequestAPI()
export const RequestReadonly = new RequestReadonlyAPI()
export const Hub = HubAll.use(NetworkPluginID.PLUGIN_EVM)!
export const Others = OthersAll.use(NetworkPluginID.PLUGIN_EVM)!

export const FlowWeb3State = new FlowWeb3StateAPI()
export const FlowWeb3 = Web3All.use(NetworkPluginID.PLUGIN_FLOW)!
export const FlowHub = HubAll.use(NetworkPluginID.PLUGIN_FLOW)!
export const FlowOthers = OthersAll.use(NetworkPluginID.PLUGIN_FLOW)!

export const SolanaWeb3State = new SolanaWeb3StateAPI()
export const SolanaWeb3 = Web3All.use(NetworkPluginID.PLUGIN_SOLANA)!
export const SolanaHub = HubAll.use(NetworkPluginID.PLUGIN_SOLANA)!
export const SolanaOthers = OthersAll.use(NetworkPluginID.PLUGIN_SOLANA)!

// Smart Pay
export { DepositPaymaster } from './SmartPay/libs/DepositPaymaster.js'
export { ContractWallet } from './SmartPay/libs/ContractWallet.js'
export { Create2Factory } from './SmartPay/libs/Create2Factory.js'
export { UserTransaction } from './SmartPay/libs/UserTransaction.js'

// NextID
export { NextIDProof, NextIDStorageProvider } from './NextID/index.js'

// Web3Bio
export { Web3Bio } from './Web3Bio/index.js'

// GoPlusLabs
export { GoPlusLabs } from './GoPlusLabs/index.js'

// CoinGecko
export { CoinGeckoTrending } from './CoinGecko/index.js'

// R2D2
export { R2D2TokenList } from './R2D2/index.js'

// Name Service
export { ENS } from './ENS/index.js'

// Debank
export { DeBankHistory } from './DeBank/index.js'

// NFTScan
export {
    NFTScanTrending_EVM,
    NFTScanTrending_Solana,
    NFTScanNonFungibleTokenEVM,
    NFTScanNonFungibleTokenSolana,
} from './NFTScan/index.js'

// Chainbase
export { ChainbaseHistory, ChainbaseDomain } from './Chainbase/index.js'

// Zerion
export { Zerion, ZerionGas, ZerionNonFungibleToken, ZerionTrending } from './Zerion/index.js'

// Fuse
export { Fuse, FuseCoin } from './Fuse/index.js'
export { FuseNonFungibleCollection } from './Fuse/apis/NonFungibleCollection.js'

// Smart Pay
export { SmartPayBundler } from './SmartPay/index.js'
export const SmartPayFunder = new SmartPayFunderAPI()
export const SmartPayOwner = new SmartPayOwnerAPI()
export const SmartPayAccount = new SmartPayAccountAPI()

// RSS3
export { RSS3 } from './RSS3/index.js'

// Airdrop
export const Airdrop = new AirdropAPI()

// Firefly

export { Firefly } from './Firefly/index.js'

// FiatCurrencyRate
export { FiatCurrencyRate } from './FiatCurrencyRate/index.js'

// Calendar
export { Calendar } from './Calendar/index.js'
