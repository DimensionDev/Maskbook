import { ChainId } from '../types.js'
import { Connection } from '@solana/web3.js'

const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}

export function createClientEndpoint(chainId: ChainId) {
    return Endpoints[chainId]
}

export function createClient(chainId: ChainId) {
    return new Connection(createClientEndpoint(chainId))
}
