import { ChainId, Web3ProviderType, createWeb3 } from '@masknet/web3-shared-evm'

export function createGetLatestBalance(context: Web3ProviderType) {
    return (chainId: ChainId, account: string) => {
        const web3 = createWeb3(context.request, () => ({
            chainId,
        }))
        return web3.eth.getBalance(account)
    }
}
