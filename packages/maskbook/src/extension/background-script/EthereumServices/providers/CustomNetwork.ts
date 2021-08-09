import { ChainId } from '@masknet/web3-shared'

export function createWeb3() {
    throw new Error('To be implemented.')
}

export async function requestAccounts() {
    return {
        accounts: [],
        chainId: ChainId.Mainnet,
    }
}
