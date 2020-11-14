import { ChainId } from '../types'

export const MIN_AMOUNT_LENGTH = 1
export const MAX_AMOUNT_LENGTH = 79

export const CONSTANTS = {
    // token list
    // working in progress here: https://github.com/DimensionDev/Maskbook-Token-List/issues/2
    TOKEN_LISTS: {
        // Add Solana Tokenlist URLs
        [ChainId.Mainnet]: [] as string[],
        [ChainId.Devnet]: [] as string[],
        [ChainId.Testnet]: [] as string[],
    },
    // contracts
    SOL_ADDRESS: {
        [ChainId.Mainnet]: 'So11111111111111111111111111111111111111112',
        [ChainId.Devnet]: 'So11111111111111111111111111111111111111112',
        [ChainId.Testnet]: '',
    },
    USDC_ADDRESS: {
        [ChainId.Mainnet]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        [ChainId.Devnet]: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        [ChainId.Testnet]: '',
    },
    USDT_ADDRESS: {
        [ChainId.Mainnet]: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
        [ChainId.Devnet]: 'BQcdHdAQW1hczDbBi9hiegXAR7A98Q9jx3X3iBBBDiq4',
        [ChainId.Testnet]: '',
    },
    WETH_ADDRESS: {
        [ChainId.Mainnet]: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
        [ChainId.Devnet]: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
        [ChainId.Testnet]: '',
    },
    // settings
    SOLANA_NETWORK_ADDRESS:
        process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
            ? {
                  [ChainId.Mainnet]: 'https://api.mainnet-beta.solana.com',
                  [ChainId.Testnet]: 'https://testnet.solana.com',
                  [ChainId.Devnet]: 'https://devnet.solana.com',
              }
            : {
                  [ChainId.Mainnet]: 'https://api.mainnet-beta.solana.com',
                  [ChainId.Testnet]: 'https://testnet.solana.com',
                  [ChainId.Devnet]: 'https://devnet.solana.com',
              },
}
