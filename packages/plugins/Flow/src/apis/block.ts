import { ChainId, createClient } from '@masknet/web3-shared-flow'

export async function getBlock(chainId: ChainId) {
    const sdk = createClient(chainId)
    return sdk.block()
}
