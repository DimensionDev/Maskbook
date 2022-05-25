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
    mainnet = 147,
}

// export const supportedChainId = ChainId.Mainnet
// export const SWAP_CHAIN_ID = ChainId.Mainnet
// export const supportedOracleChainId = ORACLE_CHAIN_ID.mainnet

// testnet example
export const supportedChainId = ChainId.Rinkeby
export const SWAP_CHAIN_ID = ChainId.Mainnet
export const supportedOracleChainId = ORACLE_CHAIN_ID.testnet

export const errors = {
    rpc: 'Failed to fetch',
    referrerInvalid: 'Code: -32600. referrer invalid',
}
