import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import Token from '@masknet/web3-constants/solana/token.json'
import { hookTransform, transform } from '@masknet/web3-kit'
import { ChainId } from '../types'

export const getTokenConstants = transform(ChainId, Token)
export const useTokenConstants = hookTransform(getTokenConstants)

export const NETWORK_ENDPOINTS: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-api.projectserum.com',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}

export const SPL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID.toBase58()
