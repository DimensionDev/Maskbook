export {
    getRegisteredWeb3Chains,
    getRegisteredWeb3Networks,
    getRegisteredWeb3Providers,
    initWallet,
    getActivatedPluginWeb3State,
    getAllPluginsWeb3State,
} from './Manager/index.js'
export { evm } from './Manager/registry.js'

export { RedPacket } from './RedPacket/index.js'
export { SimpleHashEVM, SimpleHashSolana, SPAM_SCORE } from './SimpleHash/index.js'

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
export { EVMWeb3 } from './Web3/EVM/apis/ConnectionAPI.js'
export { EVMWeb3Readonly } from './Web3/EVM/apis/ConnectionReadonlyAPI.js'
export { EVMRequest } from './Web3/EVM/apis/RequestAPI.js'
export { EVMRequestReadonly } from './Web3/EVM/apis/RequestReadonlyAPI.js'
export { EVMHub } from './Web3/EVM/apis/HubAPI.js'
export { EVMUtils } from './Web3/EVM/apis/Utils.js'

// Firefly

export { FireflyConfig, FireflyRedPacket } from './Firefly/index.js'
