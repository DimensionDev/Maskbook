import { type web3 } from '@coral-xyz/anchor'
import { getSolanaProvider } from './getSolanaProvider.js'

export async function getTokenBalance(tokenAccount: web3.PublicKey) {
    const provider = await getSolanaProvider()
    const response = await provider.connection.getTokenAccountBalance(tokenAccount)
    return response.value
}
