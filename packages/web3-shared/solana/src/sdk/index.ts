import { ChainId } from '../types.js'
import { Connection } from '@solana/web3.js'

const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana--mainnet.datahub.figment.io/apikey/30d4290fe1f4fcf371a9e27c513d099f',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}

export function createClientEndpoint(chainId: ChainId) {
    return Endpoints[chainId]
}

export function createClient(chainId: ChainId) {
    return new Connection(createClientEndpoint(chainId))
}
