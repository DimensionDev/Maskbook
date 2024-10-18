import { ChainId } from '../types.js'

const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-mainnet.phantom.app/YBPpkkN4g91xDiAnTE9r0RcMkjg0sKUIWvAfoFVJ',
    [ChainId.Invalid]: '',
}

export function createClientEndpoint(chainId = ChainId.Mainnet) {
    return Endpoints[chainId]
}

export function createClient(chainId = ChainId.Mainnet) {
    throw new Error('Not implemented')
}
