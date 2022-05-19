import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = 'com.maskbook.referral'
export const META_KEY = `${PLUGIN_ID}:1`

export const MASK_REFERRER = '0x172059839d80773eC8617C4CB33835175d364cEE'

export const MASK_SWAP_V1 = 'maskswapv1'
export const ATTRACE_FEE_PERCENT = 5

export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
export const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

enum ORACLE_CHAIN_ID {
    testnet = 4470,
    mainnet = 47,
}

// TODO: change to Mainnet before mainnet release
export const supportedChainId = ChainId.Rinkeby
export const SWAP_CHAIN_ID = ChainId.Mainnet
export const REFERRAL_FARMS_V1_ADDR = '0x5c057Fd6830fCAecA2BC76A8FBFf9b03D274Ce13'
export const CONFIRMATION_V1_ADDR = '0x1d7216020f8FF3Fb32C7AD96F583a6D7b65E985A'
export const supportedOracleChainId = ORACLE_CHAIN_ID.testnet

export const errors = {
    rpc: 'Failed to fetch',
}
