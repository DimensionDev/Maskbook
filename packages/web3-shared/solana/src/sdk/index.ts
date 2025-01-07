import { ChainId } from '../types.js'

const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ',
    [ChainId.Testnet]: '',
    [ChainId.Devnet]: '',
    [ChainId.Invalid]: '',
}

export function createClientEndpoint(chainId = ChainId.Mainnet) {
    return Endpoints[chainId]
}
