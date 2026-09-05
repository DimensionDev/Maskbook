export {
    getRegisteredWeb3Chains,
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    initWallet,
    getActivatedPluginWeb3State,
    getAllPluginsWeb3State,
} from './Manager/index.js'
export { evm } from './Manager/registry.js'

export { Lido } from './Lido/index.js'
export { Twitter } from './Twitter/index.js'
export { Minds } from './Minds/index.js'
export { Instagram } from './Instagram/index.js'
export { DSearch } from './DSearch/index.js'
export { CryptoScamDB } from './CryptoScamDB/index.js'
export { LensV3 } from './LensV3/index.js'
export { RedPacket } from './RedPacket/index.js'
export { SnapshotSearch } from './Snapshot/index.js'
export { Snapshot } from './Snapshot/index.js'

export {
    EVMWalletProviders,
    FireflyEmbeddedWalletProviderInstance as FireflyEmbeddedWalletProvider,
} from './Web3/EVM/providers/index.js'

// Web3
export { getConnection } from './Web3/Router/apis/getConnection.js'
export { getHub } from './Web3/Router/apis/getHub.js'
export { getUtils } from './Web3/Router/apis/getUtils.js'

export {
    EVMChainResolver,
    EVMExplorerResolver,
    EVMProviderResolver,
    EVMNetworkResolver,
} from './Web3/EVM/apis/ResolverAPI.js'
export { EVMContract } from './Web3/EVM/apis/ContractAPI.js'
export { EVMContractReadonly } from './Web3/EVM/apis/ContractReadonlyAPI.js'
export { Signer } from './Web3/EVM/apis/SignerAPI.js'
export { Web3Storage } from './Storage/apis/Storage.js'
export { EVMWeb3 } from './Web3/EVM/apis/ConnectionAPI.js'
export { EVMWeb3Readonly } from './Web3/EVM/apis/ConnectionReadonlyAPI.js'
export { EVMRequest } from './Web3/EVM/apis/RequestAPI.js'
export { EVMRequestReadonly } from './Web3/EVM/apis/RequestReadonlyAPI.js'
export { EVMHub } from './Web3/EVM/apis/HubAPI.js'
export { EVMUtils } from './Web3/EVM/apis/Utils.js'

export { SolanaChainResolver, SolanaExplorerResolver } from './Web3/Solana/apis/ResolverAPI.js'
export { SOLWeb3 } from './Web3/Solana/apis/ConnectionAPI.js'

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
export { OKX } from './OKX/index.js'

// Chainbase
export { ChainbaseHistory } from './Chainbase/index.js'

// Zerion
export { Zerion } from './Zerion/index.js'

// RSS3
export { RSS3 } from './RSS3/index.js'

// Airdrop
export { Airdrop } from './Airdrop/index.js'

// Firefly

export {
    FireflyConfig,
    FireflyRedPacket,
    FireflyTwitter,
    FireflyFarcaster,
    FIREFLY_BASE_URL,
    FIREFLY_SITE_URL,
    FireflyDomain,
    // Embedded wallet (replaces @privy-io/react-auth)
    FireflyEmbeddedWalletClient,
    FireflyEmbeddedProvider,
    createFireflyEmbeddedWallet,
    PRIVY_SUPPORTED_CHAINS,
    type FireflyEmbeddedWallet,
} from './Firefly/index.js'

// FiatCurrencyRate
export { FiatCurrencyRate } from './FiatCurrencyRate/index.js'

// Calendar
export { Calendar } from './Calendar/index.js'

export * from './GoogleDriveClient/index.js'
