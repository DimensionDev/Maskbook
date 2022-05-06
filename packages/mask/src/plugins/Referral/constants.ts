import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_ID = 'com.maskbook.referral'
export const META_KEY = `${PLUGIN_ID}:1`

export const MASK_REFERRER = '0x172059839d80773eC8617C4CB33835175d364cEE'

export const MASK_SWAP_V1 = 'maskswapv1'
export const ATTRACE_FEE_PERCENT = 5

export const NATIVE_TOKEN = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
export const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000'

// TODO: change to Mainnet before mainnet release
export const supportedChainIds = [ChainId.Rinkeby]
export const SWAP_CHAIN_ID = ChainId.Mainnet
export const REFERRAL_FARMS_V1_ADDR = '0x181D7ABC3CC77A0217c5780b84ba5e289fCe6292'
export const CONFIRMATION_V1_ADDR = '0xE83f1a82756Fe4561BD42bD56D9fF8E6256dFb1A'

export const APR = 'N/A'

// set DISABLE_PLUGIN = false to test it
export const DISABLE_PLUGIN = true
