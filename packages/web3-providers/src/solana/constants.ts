import { PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { ChainId } from '@masknet/web3-shared-solana'

export const RAYDIUM_TOKEN_LIST = 'https://api.raydium.io/v2/sdk/token/raydium.mainnet.json'
export const SPL_TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ID.toBase58()
export const ENDPOINT_KEY = 'mainnet-beta'
export const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
export const NETWORK_ENDPOINTS: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana--mainnet.datahub.figment.io/apikey/30d4290fe1f4fcf371a9e27c513d099f',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}
